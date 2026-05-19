from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict, Any

class DesignRequest(BaseModel):
    prompt: str = Field(..., description="Prompt describing the system to design, e.g. 'scalable Netflix architecture'")
    force: bool = Field(default=False, description="Bypass cache and force a fresh generation from Groq AI")

class SystemDesignSchema(BaseModel):
    title: str = Field(..., description="A short, professional title for the generated architecture")
    overview: str = Field(..., description="Detailed high-level system overview including goals and assumptions")
    services: List[Dict[str, str]] = Field(..., description="List of microservices, each with 'name' and 'responsibility'")
    database: str = Field(..., description="Database recommendations, storage strategy, and key schema outlines")
    api_design: str = Field(..., description="REST or gRPC API design showing primary endpoints, methods, requests, and responses")
    scalability: str = Field(..., description="Scalability approaches: sharding, horizontal scaling, load balancing, etc.")
    security: str = Field(..., description="Security considerations, authentication, authorization, and data encryption")
    caching: str = Field(..., description="Caching strategy including Redis, Memcached, CDN, and eviction policies")
    monitoring: str = Field(..., description="Monitoring, logging, telemetry, metrics, and alerting strategies")
    deployment: str = Field(..., description="Deployment suggestions, Docker, container orchestration, and CI/CD pipeline")
    mermaid_diagram: str = Field(..., description="A complete, syntactically correct, and valid Mermaid diagram starting with graph TD or sequenceDiagram representing the service interactions. Avoid syntax errors.")

class DesignHistoryResponse(BaseModel):
    id: int
    prompt: str
    response: SystemDesignSchema
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "prompt": "Design Netflix",
                "created_at": "2026-05-18T16:00:00Z",
                "response": {
                    "title": "Scalable Netflix Video Streaming Architecture",
                    "overview": "Netflix requires high availability...",
                    "services": [{"name": "Auth Service", "responsibility": "Handles user auth"}],
                    "database": "Cassandra for user metadata...",
                    "api_design": "POST /api/v1/auth ...",
                    "scalability": "Horizontal scaling with AWS EC2...",
                    "security": "OAuth 2.0...",
                    "caching": "Redis for session data...",
                    "monitoring": "Prometheus & Grafana...",
                    "deployment": "Dockerized containers...",
                    "mermaid_diagram": "graph TD\nUser --> API_Gateway"
                }
            }
        }
