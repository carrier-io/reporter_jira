from smtplib import SMTP
from typing import Optional

from pydantic import BaseModel, AnyUrl
from pydantic.class_validators import validator
from pydantic.fields import ModelField
from pylon.core.tools import log


class IntegrationModel(BaseModel):
    url: AnyUrl
    login: str
    passwd: str
    project: str
    issue_type: str

    def check_connection(self) -> bool:
        import requests
        print('checking', self.url, requests.get(self.url))
        try:
            response = requests.get(self.url)
            return response.ok
        except requests.exceptions.ConnectionError:
            return False
