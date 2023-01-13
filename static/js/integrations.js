const JiraIntegration = {
    delimiters: ['[[', ']]'],
    props: ['instance_name', 'display_name', 'logo_src', 'section_name'],
    emits: ['update'],
    template: `
<div
        :id="modal_id"
        class="modal modal-small fixed-left fade shadow-sm" tabindex="-1" role="dialog"
        @dragover.prevent="modal_style = {'height': '300px', 'border': '2px dashed var(--basic)'}"
        @drop.prevent="modal_style = {'height': '100px', 'border': ''}"
>
    <ModalDialog
            v-model:description="description"
            v-model:is_default="is_default"
            @update="update"
            @create="create"
            :display_name="display_name"
            :id="id"
            :is_fetching="is_fetching"
            :is_default="is_default"
    >
        <template #body>
            <div class="form-group">
                <h9>URL</h9>
                <input type="text" class="form-control form-control-alternative"
                    placeholder="URL"
                    v-model="url"
                    :class="{ 'is-invalid': error.url }">
                <div class="invalid-feedback">[[ error.url ]]</div>

                <h9>Jira version</h9>
                <div class="select-validation">
                    <select class="selectpicker bootstrap-select__b mb-3" 
                        v-model="jira_version"
                        data-style="btn" 
                        name="jira_version" 
                        id="jira_version">
                        <option style="text-transform:none;" value="jira8.3_or_earlier">Jira Server versions 8.3 and earlier</option>
                        <option style="text-transform:none;" value="jira8.4_or_later">Jira Server versions 8.4 and later</option>
                        <option style="text-transform:none;" value="jira_cloud">Jira Cloud</option>
                    </select>
                </div>

                <div class="form-group form-row">
                    <div class="col-6">
                        <h9>Login</h9>
                        <input type="text" class="form-control form-control-alternative"
                            placeholder="Login"
                            v-model="login"
                            :class="{ 'is-invalid': error.login }"
                        >
                        <div class="invalid-feedback">[[ error.login ]]</div>
                    </div>
                    <div class="col-6">
                        <h9>Password</h9>
                        <SecretFieldInput
                            v-model="passwd"
                            placeholder="SMTP password"
                            :class="{ 'is-invalid': error.passwd }"
                        />
                        <div class="invalid-feedback">[[ error.passwd ]]</div>
                    </div>
                </div>

                <h9>Project</h9>
                <input type="text" class="form-control form-control-alternative"
                    placeholder="Project"
                    v-model="project"
                    :class="{ 'is-invalid': error.project }">
                <div class="invalid-feedback">[[ error.project ]]</div>

                <h9>Issue Type</h9>
                <input type="text" class="form-control form-control-alternative"
                    placeholder="Issue Type"
                    v-model="issue_type"
                    :class="{ 'is-invalid': error.issue_type }">
                <div class="invalid-feedback">[[ error.issue_type ]]</div>
            </div>
        </template>
        <template #footer>
            <test-connection-button
                    :apiPath="api_base + 'check_settings/' + pluginName"
                    :error="error.check_connection"
                    :body_data="body_data"
                    v-model:is_fetching="is_fetching"
                    @handleError="handleError"
            >
            </test-connection-button>
        </template>

    </ModalDialog>
</div>
    `,
    data() {
        return this.initialState()
    },
    mounted() {
        this.modal.on('hidden.bs.modal', e => {
            this.clear()
        })
    },
    computed: {
        apiPath() {
            return this.api_base + 'integration/'
        },
        project_id() {
            return getSelectedProjectId()
        },
        body_data() {
            const {url, jira_version, login, passwd, project, issue_type, description, is_default, project_id, status} = this
            return {url, jira_version, login, passwd, project, issue_type, description, is_default, project_id, status}
        },
        test_connection_class() {
            if (200 <= this.test_connection_status && this.test_connection_status < 300) {
                return 'btn-success'
            } else if (this.test_connection_status > 0) {
                return 'btn-warning'
            } else {
                return 'btn-secondary'
            }
        },
        modal() {
            return $(this.$el)
        },
        modal_id() {
            return `${this.instance_name}_integration`
        }
    },
    watch: {
        is_fetching(newState, oldState) {
            if (newState) {
                this.test_connection_status = 0
            }
        },
        jira_version() {
            this.$nextTick(this.update_pickers)
        }
    },
    methods: {
        clear() {
            Object.assign(this.$data, this.initialState())
        },
        load(stateData) {
            Object.assign(this.$data, stateData)
        },
        handleEdit(data) {
            const {description, is_default, id, settings} = data
            this.load({...settings, description, is_default, id})
            this.modal.modal('show')
        },
        handleDelete(id) {
            this.load({id})
            this.delete()
        },
        create() {
            this.is_fetching = true
            fetch(this.apiPath + this.pluginName, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                }
            })
        },
        handleError(response) {
            try {
                response.json().then(
                    errorData => {
                        errorData.forEach(item => {
                            this.error = {[item.loc[0]]: item.msg}
                        })
                    }
                )
            } catch (e) {
                alertMain.add(e, 'danger-overlay')
            }
        },
        update() {
            this.is_fetching = true
            fetch(this.apiPath + this.id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                    // alertMain.add('Jira reporter updated!', 'success-overlay')
                    // setTimeout(() => location.reload(), 1500)
                } else {
                    this.handleError(response)
                }
            })
        },
        delete() {
            this.is_fetching = true
            fetch(this.apiPath + this.id, {
                method: 'DELETE',
            }).then(response => {
                this.is_fetching = false

                if (response.ok) {
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                    // alertMain.add('Jira integration deleted')
                    // setTimeout(() => location.reload(), 1000)
                } else {
                    this.handleError(response)
                    alertMain.add(`
                        Deletion error. 
                        <button class="btn btn-primary" 
                            onclick="vueVm.registered_components.${this.instance_name}.modal.modal('show')"
                        >
                            Open modal
                        <button>
                    `)
                }
            })
        },
        update_pickers() {
            $(this.$el).find('.selectpicker').selectpicker('redner').selectpicker('refresh')
        },

        initialState: () => ({
            modal_style: {'height': '100px', 'border': ''},
            url: '',
            jira_version: '',
            login: '',
            passwd: '',
            project: '',
            issue_type: '',
            description: '',
            is_default: false,
            is_fetching: false,
            error: {},
            id: null,
            template: '',
            fileName: '',
            pluginName: 'reporter_jira',

            api_base: '/api/v1/integrations/',
            status: integration_status.success,
        })
    }
}

register_component('JiraIntegration', JiraIntegration)
