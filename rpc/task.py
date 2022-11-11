import json
from typing import Optional

from pylon.core.tools import log
from pylon.core.tools import web


from tools import rpc_tools, task_tools, data_tools, constants


class RPC:
    integration_name = 'reporter_jira'

    # todo: change rpc to event listener
    @web.rpc(f'{integration_name}_created_or_updated')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def handle_create_task(self, integration_data: dict) -> Optional[str]:
        log.info('reporter jira %s', integration_data['settings'])
        return None

        # todo: update task
