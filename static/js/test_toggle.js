const JiraField = {
    props: ['field_key', 'field_value', 'index'],
    emits: ['remove', 'update:field_key', 'update:field_value'],
    delimiters: ['[[', ']]'],
    template: `
        <div class="d-flex">
            <div class="col">
                <input type="text" placeholder="Key" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_key', $event.target.value)"
                    :value="field_key"
                    />
            </div>
            <div class="col">
                <input type="text" placeholder="Value" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_value', $event.target.value)"
                    :value="field_value"
                />
            </div>
            <div class="align-self-center">
                <button class="btn btn-primary btn-37" 
                    @click.prevent="$emit('remove', index)"
                >
                    <i class="fa fa-minus"></i>
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
        <div class="col-6 p-0">
            <label class="mb-0">
                <h9 class="text-capitalize">[[ field_key ]]</h9>
                <input type="text" class="form-control form-control-alternative mt-1"
                    :placeholder="field_value"
                    :value="field_value"
                    @input="$emit('update:field_value', $event.target.value)"
                >
            </label>
        </div>
    `
}

const JiraDynamicField = {
    props: ['field_condition', 'field_key', 'field_value', 'index'],
    emits: ['remove', 'update:field_condition', 'update:field_key', 'update:field_value'],
    delimiters: ['[[', ']]'],
    template: `
        <div class="d-flex">
            <div class="col">
                <input type="text" placeholder="Condition" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_condition', $event.target.value)"
                    :value="field_condition"
                    />
            </div>
            <div class="col">
                <input type="text" placeholder="Key" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_key', $event.target.value)"
                    :value="field_key"
                    />
            </div>
            <div class="col">
                <input type="text" placeholder="Value" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_value', $event.target.value)"
                    :value="field_value"
                />
            </div>
            <div class="align-self-center">
                <button class="btn btn-primary btn-37" 
                    @click.prevent="$emit('remove', index)"
                >
                    <i class="fa fa-minus"></i>
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
    props: ['instance_name', 'section', 'selected_integration', 'is_selected'],
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
            return data
        },
    },
    methods: {
        get_data() {
            if (this.is_selected) {
                const {selected_integration: id} = this
                return {id, ...this.body_data}
            }
        },
        set_data(data) {
            const {id, ...rest} = data
            this.load(rest)
            this.$emit('set_data', {id})
        },
        clear_data() {
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
        },
        clear() {
            Object.assign(this.$data, this.initialState())
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

        handleError(data) {
            this.errors[data.loc[data.loc.length - 1]] = data.msg
            // console.log(data)
            // data.forEach(item => {
            //     console.log('item error', item)
            //     this.error[item.loc[item.loc.length]] = item.msg
            // })

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
            is_adv_settins_open: false,

        })
    },
    template: `
        <div class="row mt-2">
            <div class="col">
                <h9>Jira fields</h9>
                <p>
                    <h13>For all</h13>
                </p>
            </div>
            <button class="btn btn-primary btn-37"
                    @click.prevent="add_jira_field"
            ><i class="fa fa-plus"></i></button>
        </div>

        <div class="row">
            <JiraField
                    v-for="(item, index) in fields"
                    v-model:field_key="item.key"
                    v-model:field_value="item.value"
                    :index="index"
                    @remove="removeJiraField"
            ></JiraField>
        </div>

        <div class="section mt-3">
            <div class="row" 
                    data-toggle="collapse" 
                    data-target="#advancedBackend" 
                    role="button" 
                    aria-expanded="false" 
                    aria-controls="advancedBackend"
                    @click="is_adv_settins_open = !is_adv_settins_open"
                >
                <div class="col">
                    <h12>ADVANCED SETTINGS <i class="fa" 
                    :class="is_adv_settins_open ? 'fa-angle-down' : 'fa-angle-right'"></i>
                    
                    </h12>
                </div>
                <div class="col">
                    <div class="col-xs text-right">
                        <button type="button" class="btn btn-nooutline-secondary mr-2"
                                data-toggle="collapse" data-target="#advancedBackend">
                        </button>
                    </div>
                </div>
            </div>
            <div class="collapse row pt-4" id="advancedBackend"
                ref="advanced_params"
            >
            <div class="col-mt-2">
                <div class="row mt-2">
                    <div class="col-12 p-0">
                        <h9>Change priority mapping</h9>
                        <p>
                            <h13>Description</h13>
                        </p>
                    </div>
                    <div class="row">
                        <JiraPriorityMapping
                                v-for="k in Object.keys(priority_mapping)"
                                :field_key="k"
                                v-model:field_value="priority_mapping[k]"
                        ></JiraPriorityMapping>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-12 p-0">
                        <h9>Limits</h9>
                        <p>
                            <h13>Description</h13>
                        </p>
                    </div>
                    <div class="row col-12 p-0">
                        <div class="col">
                            <label>
                                <h9>Max description size</h9>
                                <input type="number" placeholder="Value"
                                    class="form-control form-control-alternative"
                                    v-model="limits.max_description_size"
                                    :class="{ 'is-invalid': errors.max_description_size }"
                                />
                                <div class="invalid-feedback">[[ errors.max_description_size ]]</div>
                            </label>

                        </div>
                        <div class="col">
                            <label>
                                <h9>Max comment size</h9>
                                <input type="number" placeholder="Value"
                                    class="form-control form-control-alternative"
                                    v-model="limits.max_comment_size"
                                    :class="{ 'is-invalid': errors.max_comment_size }"
                                />
                                <div class="invalid-feedback">[[ errors.max_comment_size ]]</div>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="row mt-2">
                    <div class="col">
                        <h9>Dynamic fields</h9>
                        <p>
                            <h13>Description</h13>
                        </p>
                    </div>
                    <button class="btn btn-primary btn-37"
                            @click.prevent="add_dynamic_field"
                    ><i class="fa fa-plus"></i></button>
                </div>
                <div class="row">
                    <JiraDynamicField
                            v-for="(item, index) in dynamic_fields"
                            v-model:field_condition="item.condition"
                            v-model:field_key="item.key"
                            v-model:field_value="item.value"
                            :index="index"
                            @remove="removeDynamicField"
                    ></JiraDynamicField>
                </div>

                <div class="row mt-2">
                    <div class="col">
                        <h9>Watchers</h9>
                    </div>
                </div>
                <input type="text" class="form-control form-control-alternative"
                    v-model="watchers"
                    placeholder="List of watchers"
                    style="width: 438px;"
                >


                <div class="mt-3">
                    <div class="col">
                        <label class="mb-0 w-100 d-flex align-items-center custom-checkbox">
                            <input type="checkbox" class="mr-2"
                                v-model="separate_epic_linkage"
                            >
                            <h9>Separate epic linkage</h9>
                        </label>
                        <div v-show="separate_epic_linkage" class="form-group" id="epic_linkage_key">
                            <label class="form-control-label" for="epic_filed_key">Epic field key</label>
                                <input type="text" class="form-control form-control-alternative"
                                       v-model="separate_epic_linkage_key"
                                       placeholder="Key"
                                       style="width: 438px;"
                                >
                        </div>
                    </div>

                    <div class="form-check-label">
                        <label class="mb-0 w-100 d-flex align-items-center custom-checkbox">
                            <input type="checkbox" class="mr-2"
                                v-model="use_another_jira"
                            >
                            <h9>Use another jira</h9>
                        </label>
                        <div v-show="use_another_jira" class="form-group mt-0 pt-0" id="another_jira_fields">
                            <label class="form-control-label" for="url_another_jira">URL</label>
                                <input type="text" class="form-control form-control-alternative"
                                    v-model="another_jira_url"
                                    placeholder="URL to another Jira"
                                    style="width: 438px;"
                                    :class="{ 'is-invalid': errors.another_jira_url }"
                                >
                                <div class="invalid-feedback">[[ errors.another_jira_url ]]</div>
                            <div class="row">
                                <div class="col ml-0 pl-0">
                                    <label class="form-control-label" for="login_another_jira">Login</label>
                                    <input type="text" class="form-control form-control-alternative mt-1"
                                        v-model="another_jira_login"
                                        placeholder="Login to another Jira"
                                        style="width: 193px;"
                                        :class="{ 'is-invalid': errors.another_jira_login }"
                                    >
                                    <div class="invalid-feedback">[[ errors.another_jira_login ]]</div>
                                </div>
                                <div class="col ml-0 pl-0">
                                    <label class="form-control-label" for="password_another_jira">Password (from Secrets)</label>
                                    <input type="text" class="form-control form-control-alternative mt-1"
                                        v-model="another_jira_password"
                                        placeholder="Password (secret field)"
                                        style="width: 199px;"
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
                            <h9>Reopen if closed</h9>
                        </label>
                    </div>
                </div>
            </div>
            </div>
        </div>        

`
}

register_component('reporter-jira', JiraIntegration)
