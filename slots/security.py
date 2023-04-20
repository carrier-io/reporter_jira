from pylon.core.tools import log, web


class Slot:
    integration_name = 'reporter_jira'
    section_name = 'reporters'

    @web.slot(f'security_{section_name}_content')
    def toggle_content(self, context, slot, payload):
        project_id = self.context.rpc_manager.call.project_get_id()
        integrations = context.rpc_manager.call.integrations_get_all_integrations_by_name(
            project_id,
            Slot.integration_name
        )
        with context.app.app_context():
            return self.descriptor.render_template(
                'test_toggle/content.html',
                project_integrations=integrations
            )

    @web.slot(f'security_{section_name}_scripts')
    def toggle_scripts(self, context, slot, payload):
        with context.app.app_context():
            return self.descriptor.render_template(
                'test_toggle/scripts.html',
            )
