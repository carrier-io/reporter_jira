const JiraField = {
    props: ['field_key', 'field_value', 'index'],
    emits: ['remove', 'update:field_key', 'update:field_value'],
    delimiters: ['[[', ']]'],
    template: `
        <div class="d-flex mt-3">
            <div class="w-100 mr-3">
                <input type="text" placeholder="Key" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_key', $event.target.value)"
                    :value="field_key"
                    />
            </div>
            <div class="w-100 mr-3">
                <input type="text" placeholder="Value" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_value', $event.target.value)"
                    :value="field_value"
                />
            </div>
            <div class="align-self-center">
                <button class="btn btn-default btn-xs btn-icon__xs"
                    @click.prevent="$emit('remove', index)">
                    <i class="icon__18x18 icon-remove-element"></i>
                </button>
            </div>
        </div>
    `
}

const JiraPriorityMapping = {
    props: ['field_key', 'field_value'],
    emits: ['update:field_key', 'update:field_value'],
    delimiters: ['[[', ']]'],
    template: `
        <div>
            <p class="font-h6 font-semibold mb-1">[[ field_key ]]</p>
            <input type="text" class="form-control form-control-alternative mt-1"
                :placeholder="field_value"
                :value="field_value"
                @input="$emit('update:field_value', $event.target.value)"
            >
        </div>
    `
}

const JiraDynamicField = {
    props: ['field_condition', 'field_key', 'field_value', 'index'],
    emits: ['remove', 'update:field_condition', 'update:field_key', 'update:field_value'],
    delimiters: ['[[', ']]'],
    template: `
        <div class="d-flex mb-3">
            <div class="w-100 mr-3">
                <input type="text" placeholder="Condition" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_condition', $event.target.value)"
                    :value="field_condition"
                    />
            </div>
            <div class="w-100 mr-3">
                <input type="text" placeholder="Key" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_key', $event.target.value)"
                    :value="field_key"
                    />
            </div>
            <div class="w-100 mr-3">
                <input type="text" placeholder="Value" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_value', $event.target.value)"
                    :value="field_value"
                />
            </div>
            <div class="align-self-center">
                <button class="btn btn-default btn-xs btn-icon__xs"
                    @click.prevent="$emit('remove', index)">
                    <i class="icon__18x18 icon-remove-element"></i>
                </button>
            </div>
        </div>
    `
}

const JiraIntegration = {
    delimiters: ['[[', ']]'],
    components: {
        JiraField,
        JiraPriorityMapping,
        JiraDynamicField
    },
    props: ['instance_name', 'section', 'selected_integration', 'is_selected', 'integration_data'],
    emits: ['set_data', 'clear_data'],
    data() {
        return this.initialState()
    },
    computed: {
        body_data() {
            const data = { ...this.$data }
            delete data.errors
            data.fields = data.fields.filter(item => item.key !== '')
            data.dynamic_fields = data.dynamic_fields.filter(item => item.condition !== '')
            data.project_id = this.integration_data.project_id
            data.is_local = !!this.integration_data.project_id
            return data
        },
    },
    methods: {
        get_data() {
            if (this.is_selected) {
                const {selected_integration: id, is_local} = this
                return {id, is_local, ...this.body_data}
            }
        },
        set_data(data) {
            const {id, is_local, ...rest} = data
            this.load(rest)
            this.$emit('set_data', {id, is_local})
        },
        clear_data() {
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
        },
        removeJiraField(index) {
            this.fields.splice(index, 1)
        },
        add_jira_field() {
            this.fields.push({key: '', value: ''})
        },
        removeDynamicField(index) {
            this.dynamic_fields.splice(index, 1)
        },
        add_dynamic_field() {
            this.dynamic_fields.push({condition:'', key: '', value: ''})
        },
        load(data) {
            Object.assign(this.$data, {...this.initialState(), ...data})
        },
        set_error(data) {
            this.errors[data.loc[data.loc.length - 1]] = data.msg
        },
        clear_errors() {
            this.errors = {}
        },
        initialState: () => ({
            fields: [],
            priority_mapping: {
                critical: 'blocker',
                high: 'major',
                medium: 'medium',
                low: 'minor',
                info: 'trivial'
            },
            limits: {
                max_description_size: 61908,
                max_comment_size: 32767,
            },
            dynamic_fields: [],
            watchers: '',
            separate_epic_linkage: false,
            separate_epic_linkage_key: '',
            use_another_jira: false,
            another_jira_url: '',
            another_jira_login: '',
            another_jira_password: '',
            reopen_if_closed: false,
            errors: {},
            is_adv_settings_open: false,

        })
    },
    template: `
        <div class="row mt-3">
            <div class="col">
                <p class="font-h5 font-semibold">Jira fields</p>
                <p class="font-h6 font-weight-400">For all</p>
            </div>
            <button class="btn btn-default btn-xs btn-icon__xs align-self-center"
                @click.prevent="add_jira_field">
                <i class="icon__18x18 icon-create-element"></i>
            </button>
        </div>

        <div>
            <JiraField
                    v-for="(item, index) in fields"
                    v-model:field_key="item.key"
                    v-model:field_value="item.value"
                    :index="index"
                    @remove="removeJiraField"
            ></JiraField>
        </div>

        <div class="mt-3">
            <div class="row" 
                    data-toggle="collapse" 
                    data-target="#advancedBackend" 
                    role="button" 
                    aria-expanded="false" 
                    aria-controls="advancedBackend"
                    @click="is_adv_settings_open = !is_adv_settings_open"
                >
                <div>
                    <p class="font-h6 font-semibold text-gray-600">ADVANCED SETTINGS 
                        <button class="btn btn-nooutline-secondary p-0 pb-1 ml-1 collapsed">
                            <i class="icon__16x16 icon-arrow-down__16" :class="is_adv_settings_open ? '' : 'rotate-270'"></i>
                        </button>
                    </p>
                </div>
                <div class="col">
                    <div class="col-xs text-right">
                        <button type="button" class="btn btn-nooutline-secondary mr-2"
                                data-toggle="collapse" data-target="#advancedBackend">
                        </button>
                    </div>
                </div>
            </div>
            <div class="collapse row" id="advancedBackend"
                ref="advanced_params"
            >
            <div class="col mt-2">
                <div class="mt-4">
                    <div class="col-12 p-0 mb-2">
                        <p class="font-h5 font-semibold">Change priority mapping</p>
                    </div>
                    <div class="d-grid grid-column-2 gap-3">
                        <JiraPriorityMapping
                                v-for="k in Object.keys(priority_mapping)"
                                :field_key="k"
                                v-model:field_value="priority_mapping[k]"
                        ></JiraPriorityMapping>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="col-12 p-0 mb-2">
                        <p class="font-h5 font-semibold">Limits</p>
                    </div>
                    <div class="d-grid grid-column-2 gap-3">
                        <div>
                            <p class="font-h6 font-semibold mb-1">Max description size</p>
                            <input type="number" placeholder="Value"
                                class="form-control form-control-alternative"
                                v-model="limits.max_description_size"
                                :class="{ 'is-invalid': errors.max_description_size }"
                            />
                            <div class="invalid-feedback">[[ errors.max_description_size ]]</div>
                        </div>
                        <div>
                            <p class="font-h6 font-semibold mb-1">Max comment size</p>
                            <input type="number" placeholder="Value"
                                class="form-control form-control-alternative"
                                v-model="limits.max_comment_size"
                                :class="{ 'is-invalid': errors.max_comment_size }"
                            />
                            <div class="invalid-feedback">[[ errors.max_comment_size ]]</div>
                        </div>
                    </div>
                </div>

                <div class="d-flex mt-4">
                    <div class="col p-0 mb-2">
                        <p class="font-h5 font-semibold">Dynamic fields</p>
                    </div>
                    <button class="btn btn-default btn-xs btn-icon__xs align-self-center"
                        @click.prevent="add_dynamic_field">
                        <i class="icon__18x18 icon-create-element"></i>
                    </button>
                </div>
                <div>
                    <JiraDynamicField
                            v-for="(item, index) in dynamic_fields"
                            v-model:field_condition="item.condition"
                            v-model:field_key="item.key"
                            v-model:field_value="item.value"
                            :index="index"
                            @remove="removeDynamicField"
                    ></JiraDynamicField>
                </div>
                <div class="mt-2">
                    <div class="col p-0 mb-">
                        <p class="font-h6 font-semibold mb-1">Watchers</p>
                        <input type="text" class="form-control form-control-alternative"
                            v-model="watchers"
                            placeholder="List of watchers"
                        >
                    </div>
                </div>
                <div class="mt-3">
                    <div class="col">
                        <label class="mb-2 w-100 d-flex align-items-center custom-checkbox">
                            <input type="checkbox" class="mr-2"
                                v-model="separate_epic_linkage"
                            >
                            <p class="font-h5 font-weight-400">Separate epic linkage</p>
                        </label>
                        <div v-show="separate_epic_linkage" class="form-group" id="epic_linkage_key">
                            <label class="form-control-label font-h6 font-semibold mb-1" for="epic_filed_key">Epic field key</label>
                                <input type="text" class="form-control form-control-alternative mt-0"
                                       v-model="separate_epic_linkage_key"
                                       placeholder="Key"
                                >
                        </div>
                    </div>

                    <div class="form-check-label">
                        <label class="mb-2 w-100 d-flex align-items-center custom-checkbox">
                            <input type="checkbox" class="mr-2"
                                v-model="use_another_jira"
                            >
                            <p class="font-h5 font-weight-400">Use another jira</p>
                        </label>
                        <div v-show="use_another_jira" class="form-group mt-0 pt-0" id="another_jira_fields">
                            <label class="form-control-label font-h6 font-semibold mb-1 w-100" for="url_another_jira">URL</label>
                                <input type="text" class="form-control form-control-alternative mt-0"
                                    v-model="another_jira_url"
                                    placeholder="URL to another Jira"
                                    :class="{ 'is-invalid': errors.another_jira_url }"
                                >
                                <div class="invalid-feedback">[[ errors.another_jira_url ]]</div>
                            <div class="d-grid grid-column-2 gap-3">
                                <div>
                                    <label class="form-control-label font-h6 font-semibold mb-1" for="login_another_jira">Login</label>
                                    <input type="text" class="form-control form-control-alternative my-0 w-100"
                                        v-model="another_jira_login"
                                        placeholder="Login to another Jira"
                                        :class="{ 'is-invalid': errors.another_jira_login }"
                                    >
                                    <div class="invalid-feedback">[[ errors.another_jira_login ]]</div>
                                </div>
                                <div>
                                    <label class="form-control-label font-h6 font-semibold mb-1" for="password_another_jira">Password (from Secrets)</label>
                                    <input type="text" class="form-control form-control-alternative my-0 w-100"
                                        v-model="another_jira_password"
                                        placeholder="Password (secret field)"
                                        :class="{ 'is-invalid': errors.another_jira_password }"
                                    >
                                    <div class="invalid-feedback">[[ errors.another_jira_password ]]</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-check-label">
                        <label class="mb-0 w-100 d-flex align-items-center custom-checkbox">
                            <input type="checkbox" class="mr-2"
                                v-model="reopen_if_closed"
                            >
                            <p class="font-h5 font-weight-400">Reopen if closed</p>
                        </label>
                    </div>
                </div>
            </div>
            </div>
        </div>        

`
}

register_component('reporter-jira', JiraIntegration)
