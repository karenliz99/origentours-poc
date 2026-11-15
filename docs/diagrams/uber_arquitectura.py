from diagrams import Diagram
from diagrams.aws.network import APIGateway, ELB
from diagrams.aws.compute import ECS, Lambda
from diagrams.aws.database import Dynamodb, RDS
from diagrams.aws.integration import SNS
from diagrams.onprem.client import Client
with Diagram("Arquitectura AWS - app tipo Uber", filename="uber_arquitectura", show=False, direction="LR"):
    svc = ECS("Servicios (rides, matching)")
    Client("Apps pasajero/conductor") >> APIGateway("API Gateway") >> ELB("ALB") >> svc
    svc >> [RDS("RDS viajes"), Dynamodb("DynamoDB ubicaciones"), SNS("Notificaciones"), Lambda("Cobros")]
