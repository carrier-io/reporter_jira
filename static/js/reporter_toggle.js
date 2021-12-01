window['reporters_reporter_jira'] = {
    get_data: () => {
        if ($('#integration_checkbox_reporter_jira').prop('checked')) {
            const id = $('#selector_reporter_jira .selectpicker').val()
            return {id, ...jiraVm.body_data}
        }
    },
    set_data: data => {
        console.log('settings data for reporter_jira', data)
        const {id, ...rest} = data
        $('#integration_checkbox_reporter_jira').prop('checked', true)
        $('#selector_reporter_jira .selectpicker').val(id).selectpicker('refresh')
        $('#selector_reporter_jira').collapse('show')
        jiraVm.setData(rest)
    },
    clear_data: () => {
        const selector = $('#selector_reporter_jira .selectpicker')
        selector[0]?.options.forEach(item =>
            $(item).attr('data-is_default') && $(selector[0]).val($(item).val()).selectpicker('refresh')
        )
        $('#integration_checkbox_reporter_jira').prop('checked', false)
        $('#selector_reporter_jira').collapse('hide')
        $('#settings_reporter_jira').collapse('hide')
        jiraVm.clear()
    }
}

const jiraInitialState = () => ({
    fields: [],
    priority_mapping: {
        critical: 'blocker',
        high: 'major',
        medium: 'medium',
        low: 'minor',
        info: 'trivial'
    },
    limits: {
        max_description_size: '',
        max_comment_size: '',
    },
    dynamic_fields: [],
    separate_epic_linkage: false,
    use_another_jira: false,
    reopen_if_closed: false,

    errors: [],
    warnings: [],
})

const jiraApp = Vue.createApp({
    delimiters: ['[[', ']]'],
    data() {
        return jiraInitialState()
    },
    computed: {
        hasErrors() {
            return this.errors.length + this.warnings.length > 0
        },
        body_data() {
            const data = { ...this.$data }
            delete data.errors
            delete data.warnings
            data.fields = data.fields.filter(item => item.key !== '')
            data.dynamic_fields = data.dynamic_fields.filter(item => item.condition !== '')
            console.log('collected data:', data)
            return data
        }
    },
    methods: {
        clear() {
            Object.assign(this.$data, jiraInitialState())
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
        setData(data) {
            Object.assign(this.$data, {...jiraInitialState(), ...data})
        }
    },
})

jiraApp.component('jira-field', {
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
})

jiraApp.component('jira-priority-mapping', {
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
})

jiraApp.component('jira-dynamic-field', {
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
})

jiraApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13', 'h7'].includes(tag)
const jiraVm = jiraApp.mount('#reporter_jira')
