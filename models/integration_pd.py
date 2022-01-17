from typing import List

from pydantic import BaseModel, AnyUrl, validator


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


class TestModelLimits(BaseModel):
    max_comment_size: int
    max_description_size: int

    @validator('max_comment_size')
    def tmp1(cls, value):
        assert value < 100, 'Value should be < 100'
        return value

    @validator('max_description_size')
    def tmp2(cls, value):
        assert value > 100, 'Value should be > 100'
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
    reopen_if_closed: bool = False
    separate_epic_linkage: bool = False
    use_another_jira: bool = False

