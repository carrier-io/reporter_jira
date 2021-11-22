#!/usr/bin/python3
# coding=utf-8

#   Copyright 2021 getcarrier.io
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

""" Module """
from functools import partial
from pathlib import Path

import flask
import jinja2
from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import module  # pylint: disable=E0611,E0401

from .components import render_integration_create_modal, render_integration_card, render_reporter_toggle
from .models.integration_pd import IntegrationModel
from .rpc_worker import make_dusty_config
from ..shared.utils.api_utils import add_resource_to_api


class Module(module.ModuleModel):
    """ Task module """

    def __init__(self, settings, root_path, context):
        self.settings = settings
        self.root_path = root_path
        self.context = context

    def init(self):
        """ Init module """
        log.info("Initializing module Reporter Jira")
        NAME = 'reporter_jira'
        SECTION_NAME = 'reporters'

        bp = flask.Blueprint(
            NAME, f'plugins.{NAME}.plugin',
            static_folder=str(Path(__file__).parents[0] / 'static'),
            static_url_path=f'/{NAME}/static/'
        )
        bp.jinja_loader = jinja2.ChoiceLoader([
            jinja2.loaders.PackageLoader(f'plugins.{NAME}', 'templates'),
        ])

        # Register in app
        self.context.app.register_blueprint(bp)

        # Register template slot callback
        self.context.slot_manager.register_callback(f"integration_card_{NAME}", render_integration_card)
        self.context.slot_manager.register_callback(f"security_{SECTION_NAME}", render_reporter_toggle)


        self.context.rpc_manager.call.integrations_register_section(
            name=SECTION_NAME,
            integration_description='Manage reporters',
            test_planner_description='Specify reporters. You may also set reporters in <a '
                                     'href="/?chapter=Configuration&module=Integrations&page=all">Integrations</a> '
        )

        self.context.rpc_manager.call.integrations_register(
            name=NAME,
            section=SECTION_NAME,
            settings_model=IntegrationModel,
            integration_callback=render_integration_create_modal
        )

        self.context.rpc_manager.register_function(
            partial(make_dusty_config, self.context),
            name=f'dusty_config_{NAME}',
        )


    def deinit(self):  # pylint: disable=R0201
        """ De-init module """
        log.info("De-initializing Reporter Jira")
