from typing import Optional
from pylon.core.tools import log
from pylon.core.tools import web
from pydantic import ValidationError

from ..models.integration_pd import SecurityTestModel
from ...integrations.models.pd.integration import SecretField

from tools import rpc_tools, VaultClient


class RPC:
    integration_name = 'reporter_jira'

    @web.rpc(f'dusty_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)    
    def make_dusty_config(self, context, test_params, scanner_params):
        """ Prepare dusty config for this reporter """
        log.info("Test params: %s", test_params)
        log.info("Scanner params: %s", scanner_params)
        
        integration = self.context.rpc_manager.call.integrations_get_by_id(test_params['project_id'], 
                                                                           scanner_params['id'])
        
        # Get secret field (password) from secrets
        secret_field = SecretField.parse_obj(integration.settings['passwd'])
        passwd = secret_field.unsecret(test_params['project_id'])

        result = {k: v for k, v in integration.settings.items() if k not in ('login', 'passwd')}
        result['username'] = integration.settings['login']
        result['password'] = passwd
        result.update(scanner_params)
        
        # Overwrite credentials if we use another jira
        if scanner_params['use_another_jira']:
            result['url'] = scanner_params['another_jira_url']
            result['username'] = scanner_params['another_jira_login']
            vault_client = VaultClient.from_project(test_params['project_id'])
            result['password'] = vault_client.unsecret(value=scanner_params['another_jira_password'])
            del result['another_jira_url']
            del result['another_jira_login']
            del result['another_jira_password']

        log.info("Result: %s", result)
        return "jira", result

    @web.rpc(f'security_test_create_integration_validate_{integration_name}')
    @rpc_tools.wrap_exceptions(ValidationError)
    def security_test_create_integration_validate(self, data: dict, pd_kwargs: Optional[dict] = None, **kwargs) -> dict:
        if not pd_kwargs:
            pd_kwargs = {}
        pd_object = SecurityTestModel(**data)
        return pd_object.dict(**pd_kwargs)
