// Styles
import './VDateField.sass'

// Components
import { VDialog } from '@/components/VDialog'
import { VMenu } from '@/components/VMenu'
import { VTextField } from '@/components/VTextField'
import { VDefaultsProvider } from '@/components/VDefaultsProvider'
import { VDateCard, VDatePicker } from '../VDatePicker'

// Composables
import { useDate } from '@/composables/date'
import { useDisplay } from '@/composables'
import { useProxiedModel } from '@/composables/proxiedModel'

// Utilities
import { computed, ref, watch } from 'vue'
import { defineComponent, useRender } from '@/util'

export const VDateField = defineComponent({
  name: 'VDateField',

  props: {
    prependIcon: {
      type: String,
      default: '$calendar',
    },
    placeholder: {
      type: String,
      default: 'mm/dd/yyyy',
    },
    label: String,
    modelValue: null,
    locale: null,
    mobile: Boolean,
  },

  emits: {
    'update:modelValue': (date: any) => true,
  },

  setup (props, { slots, emit }) {
    const locale = computed(() => props.locale)
    const { adapter } = useDate(locale)
    const model = useProxiedModel(props, 'modelValue')
    const inputModel = ref('')
    const textFieldRef = ref<VTextField>()
    const selected = ref()

    watch(inputModel, (newValue, oldValue) => {
      if (!newValue) model.value = null

      if (oldValue === newValue) return

      // TODO: Better valid check here
      if (newValue.length === 10 && adapter.value.isValid(newValue)) {
        model.value = adapter.value.date(newValue)
      }
    })

    watch(model, newValue => {
      if (!newValue) return

      inputModel.value = adapter.value.format(newValue, 'keyboardDate')
    })

    const { mobile } = useDisplay()

    useRender(() => {
      const activator = ({ props: slotProps }: any) => (
        <div { ...slotProps }>
          <VTextField
            v-model={ inputModel.value }
            prependInnerIcon={ props.prependIcon }
            placeholder={ props.placeholder }
            label={ props.label }
            ref={ textFieldRef }
          />
        </div>
      )

      return mobile.value ? (
        <VDialog
          contentClass="v-date-field__dialog-content"
          v-slots={{
            activator,
            default: ({ isActive }) => (
              <VDatePicker
                v-model={ selected.value }
                showActions
                onSave={() => {
                  model.value = selected.value
                  isActive.value = false
                }}
                onCancel={() => {
                  isActive.value = false
                  selected.value = model.value
                }}
              />
            ),
          }}
        />
      ) : (
        <VDefaultsProvider defaults={{ VOverlay: { minWidth: '100%' } }}>
          <VMenu
            closeOnContentClick={ false }
            offset={ [-30, 0] }
            v-slots={{
              activator,
              default: ({ isActive }) => (
                <VDateCard
                  modelValue={ model.value }
                  onUpdate:modelValue={(value: any) => {
                    isActive.value = false
                    model.value = value
                    textFieldRef.value?.focus()
                  }}
                />
              ),
            }}
          />
        </VDefaultsProvider>
      )
    })
  },
})