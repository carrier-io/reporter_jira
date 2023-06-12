import json
from typing import Optional
from pylon.core.tools import log
from pylon.core.tools import web
from pydantic import ValidationError

from ..models.integration_pd import PerformanceBackendTestModel, PerformanceUiTestModel

from tools import rpc_tools


class RPC:
    integration_name = 'reporter_jira'

    @web.rpc(f'backend_performance_test_create_integration_validate_{integration_name}')
    @rpc_tools.wrap_exceptions(ValidationError)
    def backend_performance_test_create_integration_validate(self, data: dict, pd_kwargs: Optional[dict] = None, **kwargs) -> dict:
        if not pd_kwargs:
            pd_kwargs = {}
        pd_object = PerformanceBackendTestModel(**data)
        return pd_object.dict(**pd_kwargs)

    @web.rpc(f'backend_performance_execution_json_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def backend_make_execution_json_config(self, integration_data: dict, project_id: int) -> dict:
        """ Prepare execution_json for this integration """
        integration_id = integration_data.get('id')
        integration = self.context.rpc_manager.call.integrations_get_by_id(project_id, integration_id)
        
        integration_data['integration_settings'] = integration.settings
        integration_data['integration_settings']['passwd'] = integration.settings['passwd']['value']
        integration_data['task_id'] = integration.task_id
        
        # Overwrite credentials if we use another jira
        if integration_data['use_another_jira']:
            integration_data['integration_settings']['url'] = integration_data['another_jira_url']
            integration_data['integration_settings']['login'] = integration_data['another_jira_login']
            integration_data['integration_settings']['passwd'] = integration_data['another_jira_password']
            # del integration_data['another_jira_url']
            # del integration_data['another_jira_login']
            # del integration_data['another_jira_password']

        return integration_data

    @web.rpc(f'ui_performance_test_create_integration_validate_{integration_name}')
    @rpc_tools.wrap_exceptions(ValidationError)
    def ui_performance_test_create_integration_validate(self, data: dict, pd_kwargs: Optional[dict] = None,
                                                             **kwargs) -> dict:
        if not pd_kwargs:
            pd_kwargs = {}
        pd_object = PerformanceUiTestModel(**data)
        return pd_object.dict(**pd_kwargs)

    @web.rpc(f'ui_performance_execution_json_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def ui_make_execution_json_config(self, integration_data: dict, project_id: int) -> dict:
        """ Prepare execution_json for this integration """
        # right now structures for backend and ui are identical
        integration_id = integration_data.get('id')
        integration = self.context.rpc_manager.call.integrations_get_by_id(project_id, integration_id)
        
        integration_data['integration_settings'] = integration.settings
        integration_data['integration_settings']['passwd'] = integration.settings['passwd']['value']
        integration_data['task_id'] = integration.task_id
        
        # Overwrite credentials if we use another jira
        if integration_data['use_another_jira']:
            integration_data['integration_settings']['url'] = integration_data['another_jira_url']
            integration_data['integration_settings']['login'] = integration_data['another_jira_login']
            integration_data['integration_settings']['passwd'] = integration_data['another_jira_password']
            # del integration_data['another_jira_url']
            # del integration_data['another_jira_login']
            # del integration_data['another_jira_password']

        return integration_data
