# Deploy na AWS (free tier, para estudo)

> **Status:** plano, ainda não implementado nem testado. Nada aqui foi rodado (`terraform plan`, build das imagens).
> **Objetivo:** subir o projeto numa única VM da AWS via IaC (Terraform), sem custo, só para estudo — ninguém vai usar.

## Requisito de custo

- **Nenhum real do bolso.** O teto absoluto são os **US$ 100 de créditos** do plano Free da AWS (conta da nova experiência, `us-east-2`), válidos até **24/05/2027**. Nunca ultrapassar, nunca fazer upgrade para o plano pago.
- **Gastar o mínimo possível desses créditos:**
  - preferir o que é grátis (GitHub Actions, GHCR, CodeDeploy para EC2, cotas sempre gratuitas);
  - desligar a EC2 quando não estiver em uso e rodar `terraform destroy` quando não precisar mais;
  - evitar serviços com custo fixo por hora: NAT Gateway, ALB, Elastic IP ocioso, RDS ligado à toa.
- **Antes de criar ou alterar qualquer recurso:** estimar o custo em créditos (por mês e até 24/05/2027) e revisar o `terraform plan`.
- **Referência de ritmo:** US$ 100 em 6 meses ≈ US$ 16/mês. Os alertas do AWS Budgets devem avisar bem antes disso.

## Free tier: depende da data da conta

| Conta criada | O que é grátis |
|---|---|
| **A partir de 15/07/2025** (plano Free) | US$ 100 em créditos (até US$ 200 com atividades). No plano Free a conta não gera cobrança: ao acabar créditos/prazo, os recursos param. Prazo de 6 meses (nesta conta, até 24/05/2027, conferido no painel "Custo e uso"). Instâncias elegíveis incluem `t3.micro` e `t4g.micro`. |
| **Antes disso** (free tier legado) | 750 h/mês de `t2.micro`/`t3.micro`, 30 GB de EBS e 750 h de IPv4 público nos primeiros 12 meses. Passou disso, cobra no cartão. |

## Desenho

- **Uma `t3.micro`** (elegível nos dois modelos), Ubuntu 24.04, 20 GB gp3.
- **Docker Compose** na VM: Postgres, API (NestJS) e Caddy servindo o front e fazendo proxy de `/api` → API.
- Acesso **só do seu IP** (security group), HTTP na porta 80, sem domínio/HTTPS.
- Sem Elastic IP, snapshots, RDS ou load balancer (tudo isso custa).
- **Alerta de orçamento de US$ 1** (gratuito).
- State do Terraform local.

## Terraform — `infra/main.tf`

```hcl
terraform {
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
}

provider "aws" { region = "us-east-2" } # região do projeto; na nova experiência não dá para usar outra

variable "meu_ip" { description = "seu IP público/32" }
variable "email"  { description = "para o alerta de custo" }

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

resource "aws_key_pair" "eu" {
  key_name   = "madereira"
  public_key = file("~/.ssh/id_ed25519.pub")
}

# Só o seu IP acessa: dispensa login/HTTPS para estudo
resource "aws_security_group" "app" {
  name = "madereira"
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.meu_ip]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.meu_ip]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.eu.key_name
  vpc_security_group_ids = [aws_security_group.app.id]
  root_block_device {
    volume_size = 20 # free tier cobre até 30 GB
    volume_type = "gp3"
  }
  user_data = <<-EOF
    #!/bin/bash
    set -e
    # 1 GB de RAM não aguenta npm ci + build: cria 2 GB de swap
    fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker ubuntu
  EOF
  tags = { Name = "madereira" }
}

resource "aws_budgets_budget" "alerta" {
  name         = "madereira-1-dolar"
  budget_type  = "COST"
  limit_amount = "1"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 1
    threshold_type             = "ABSOLUTE_VALUE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.email]
  }
}

output "url" { value = "http://${aws_instance.app.public_ip}" }
```

## Containers

Implementados e testados localmente (build, migrations, seed e smoke test passando pelo proxy do Caddy). O job `Docker` do CI builda as duas imagens em todo PR.

| Arquivo | O que faz |
|---|---|
| [`backend/Dockerfile`](../backend/Dockerfile) | `node:22-slim` em dois estágios. Gera o Prisma Client, builda e faz `npm prune --omit=dev`. Na subida roda `prisma migrate deploy` e depois `node dist/main`, como usuário `node`, com healthcheck em `/docs`. O CLI `prisma` foi movido para `dependencies` para sobreviver ao prune. |
| [`frontend/Dockerfile`](../frontend/Dockerfile) | Build do Vite com `VITE_API_URL=/api` e imagem final `caddy:2-alpine` com o build em `/srv`. |
| [`frontend/Caddyfile`](../frontend/Caddyfile) | Embutido na imagem do front. Faz proxy de `/api/*` para `api:3000` (tirando o prefixo), fallback de SPA para `index.html`, gzip/zstd e cache longo em `/assets/*`. |
| [`deploy/docker-compose.prod.yml`](../deploy/docker-compose.prod.yml) | `db` (Postgres 16 alpine, sem porta exposta, ajustado para pouca RAM), `api` e `web`. Só a porta do `web` é publicada (`WEB_PORT`, padrão 80). Tem limites de memória e espera o banco/API ficarem saudáveis. |
| [`deploy/.env.example`](../deploy/.env.example) | `DB_PASSWORD` (obrigatória), `WEB_PORT`, `API_IMAGE`/`WEB_IMAGE` (para usar imagens do GHCR no lugar do build local) e as opcionais da Rota do dia. |

Medido localmente com a stack rodando: cerca de 150 MB de RAM no total (db ~60, api ~70, web ~18), folgado para a `t3.micro`. A imagem da API tem ~820 MB (Debian + engines do Prisma); dá para enxugar depois.

## Uso

```bash
cd infra
terraform init
terraform apply -var meu_ip=$(curl -s ifconfig.me)/32 -var email=voce@exemplo.com

ssh ubuntu@<ip>
git clone https://github.com/caiovbs/madereira && cd madereira/deploy
cp .env.example .env && sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$(openssl rand -hex 16)/" .env
docker compose -f docker-compose.prod.yml up -d --build   # 1ª vez demora (swap)

# Terminou de estudar:
terraform destroy
```

## Para não ser cobrado

- **`terraform destroy` ao parar de estudar.** Recriar leva ~3 min. Os dados são de teste; `npm run seed` no backend repovoa.
- **IPv4 público** custa US$ 0,005/h (~US$ 3,60/mês) fora do free tier legado; na conta nova sai dos créditos. Instância destruída = sem IP = sem custo.
- **Só uma instância:** 750 h/mês cobrem uma ligada 24/7; duas estouram.
- **IP mudou?** `terraform apply` de novo com o novo `meu_ip`.
- Conferir **Billing → Free Tier** de vez em quando; o alerta de US$ 1 é a rede de segurança.

## Próximos passos

1. Criar de fato `infra/` (Terraform). Os Dockerfiles e o `deploy/` já existem.
2. Opcional: GitHub Actions buildando as imagens (evita build na `t3.micro`) e fazendo o deploy por SSH.

## Fontes

- [AWS Builder Center — The $0 AWS account in 2026](https://builder.aws.com/content/3Kkt4kNiDSUnO3n6db2weSNubzE/the-dollar0-aws-account-in-2026-free-plan-credits-guardrails)
- [AWS — EC2 Free Tier usage](https://docs.aws.amazon.com/pt_br/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html)
- [AWS Free Tier — Compute](https://aws.amazon.com/free/compute)
- [AWS — Legacy Free Tier FAQs](https://aws.amazon.com/free/legacy/free-tier-faqs)
- [AWS — 750 horas grátis de IPv4 público (2024)](https://aws.amazon.com/fr/about-aws/whats-new/2024/02/aws-free-tier-750-hours-free-public-ipv4-addresses/)
