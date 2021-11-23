window['reporters_reporter_jira'] = {
    get_data: () => {
        if ($('#integration_checkbox_reporter_jira').prop('checked')) {
            const id = $('#selector_reporter_jira .selectpicker').val()
            const recipients = emailVm.recipients
            return {id, recipients}
        }
    },
    set_data: data => {
        console.log('settings data for reporter_jira', data)
        const {id, recipients} = data
        $('#integration_checkbox_reporter_email').prop('checked', true)
        $('#selector_reporter_email .selectpicker').val(id).selectpicker('refresh')
        $('#selector_reporter_email').collapse('show')
        emailVm.recipients = recipients
    },
    clear_data: () => {
        const selector = $('#selector_reporter_email .selectpicker')
        selector[0]?.options.forEach(item =>
            $(item).attr('data-is_default') && $(selector[0]).val($(item).val()).selectpicker('refresh')
        )
        $('#integration_checkbox_reporter_email').prop('checked', false)
        $('#selector_reporter_email').collapse('hide')
        emailVm.clear()
    }
}

const jiraInitialState = () => ({
    email: '',
    recipients: [],
    errors: [],
    warnings: [],
})

const emailApp = Vue.createApp({
    delimiters: ['[[', ']]'],
    data() {
        return jiraInitialState()
    },
    computed: {
        hasErrors() {
            return this.errors.length + this.warnings.length > 0
        }
    },
    methods: {
        clear() {
            Object.assign(this.$data, {
                ...this.$data,
                ...jiraInitialState(),
            })
        },
        add(email) {
            console.log('Adding email', email)
            if (email === '') return;
            if (!this.validateEmail(email)) {
                this.errors.push(`Email ${email} is invalid`)
                return;
            }
            if (!this.validateUniqueness(email)) {
                this.warnings.push(`Email ${email} is already added`)
                return;
            }
            this.recipients.push(email);
        },
        handleAdd() {
            this.errors = []
            this.warnings = []
            this.email.split(',').forEach(i => {
                this.add(i.trim().toLowerCase())
            })
            if (!this.hasErrors) {
                this.email = ''
            }
            this.errors.length > 0 && alertCreateTest.add(`${this.errors.length} errors occurred while adding emails`, 'danger-overlay')
            this.warnings.length > 0 && alertCreateTest.add(`${this.warnings.length} warnings while adding emails`, 'warning-overlay')
        },
        validateUniqueness(email) {
            return this.recipients.find(e => e.toLowerCase() === email.toLowerCase()) === undefined
        },
        validateEmail(email) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
        },
        removeIndex(index) {
            this.recipients.splice(index, 1)
        }
    }
})

jiraApp.component('recipient', {
    props: ['email', 'index'],
    emits: ['remove'],
    delimiters: ['[[', ']]'],
    template: `
        <li class="list-group-item d-inline-flex justify-content-between p-1">
            <h13>[[ email ]]</h13>
            <button
                type="button"
                class="btn btn-action btn-24"
                title="remove"
                @click.prevent="remove"
            >
                <i class="fa fa-times"></i>
            </button>
        </li>
    `,
    methods: {
        remove() {
            console.log('Emitting removeal', this.index)
            this.$emit('remove', this.index)
        }
    }

})
jiraApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13'].includes(tag)
const jiraVm = jiraApp.mount('#reporter_email')