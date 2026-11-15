# Requiere: pip install diagrams  y Graphviz instalado.  Ejecutar: python arquitectura_aws.py
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import CloudFront, APIGateway, ELB
from diagrams.aws.storage import S3
from diagrams.aws.compute import Fargate
from diagrams.aws.database import DocumentDB
from diagrams.aws.security import SecretsManager, KMS
from diagrams.aws.management import Cloudwatch
from diagrams.aws.ml import Sagemaker
from diagrams.onprem.client import Users

with Diagram("Arquitectura tentativa AWS - PoC OrigenTours", filename="arquitectura_aws", show=False, direction="LR"):
    asesor = Users("Asesor de\nAtención al cliente")
    cdn = CloudFront("CloudFront (CDN)")
    web = S3("S3: frontend React")
    with Cluster("VPC"):
        apigw = APIGateway("API Gateway")
        alb = ELB("Load Balancer")
        with Cluster("ECS Fargate"):
            api = [Fargate("Backend Node.js\n(API + Privacy Vault)"), Fargate("Backend Node.js\n(réplica)")]
        db = DocumentDB("DocumentDB\n(vault_entries, briefs)")
    secrets = SecretsManager("Secrets Manager\n(VAULT_SECRET, API key)")
    kms = KMS("KMS (cifrado)")
    llm = Sagemaker("LLM externo\n(OpenAI API / Bedrock)")
    logs = Cloudwatch("CloudWatch\n(logs sin PII)")

    asesor >> cdn >> web
    asesor >> apigw >> alb >> api
    api[0] >> db
    api[0] >> Edge(label="solo texto anonimizado") >> llm
    api[0] >> secrets
    db >> kms
    api[0] >> logs
