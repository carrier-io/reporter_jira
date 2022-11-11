from typing import List, Union
from pydantic import BaseModel, AnyUrl, validator

from ...integrations.models.pd.integration import SecretField


class IntegrationModel(BaseModel):
    url: AnyUrl
    jira_version: str
    login: str
    passwd: Union[SecretField, str]
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


class TestModelLimits(BaseModel):
    max_comment_size: int = 32767
    max_description_size: int = 61908

    @validator('max_comment_size')
    def tmp1(cls, value):
        # assert value < 100, 'Value should be < 100'
        return value

    @validator('max_description_size')
    def tmp2(cls, value):
        # assert value > 100, 'Value should be > 100'
        return value


class TestModelPriorityMappings(BaseModel):
    critical: str = 'blocker'
    high: str = 'major'
    info: str = 'trivial'
    low: str = 'minor'
    medium: str = 'medium'


class TestModelField(BaseModel):
    key: str
    value: str


class TestModelDynamicField(TestModelField):
    condition: str


class SecurityTestModel(BaseModel):
    id: int
    fields: List[TestModelField]
    dynamic_fields: List[TestModelDynamicField]
    limits: TestModelLimits
    priority_mapping: TestModelPriorityMappings
    watchers: str
    reopen_if_closed: bool = False
    separate_epic_linkage: bool = False
    separate_epic_linkage_key: str
    use_another_jira: bool = False
    another_jira_url: AnyUrl
    another_jira_login: str
    another_jira_password: str


class PerformanceBackendTestModel(SecurityTestModel):
    ...


class PerformanceUiTestModel(PerformanceBackendTestModel):
    ...
