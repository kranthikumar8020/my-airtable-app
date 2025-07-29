<script setup lang="ts">
import { useForm, useField, defineRule } from 'vee-validate';
import { required, min, numeric, min_value, one_of } from '@vee-validate/rules';
import { useAirtableStore } from '@/stores/useAirtableStore';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

defineRule('required', required);
defineRule('min', min);
defineRule('numeric', numeric);
defineRule('min_value', min_value);
defineRule('one_of', one_of);

const productTypeOptions = [
  'Rental - Single Asset',
  'Rental - Portfolio',
  'Bridge - Fix and Flip',
  'GUC - Build to Rent',
];

const airtable = useAirtableStore();
const toast = useToast();

const { handleSubmit, errors, resetForm } = useForm({
  initialValues: {
    dealName: '',
    loanAmount: '',
    productType: '',
  },
  validationSchema: {
    dealName: 'required|min:3',
    loanAmount: 'required|numeric|min_value:1',
    productType: `required|one_of:${productTypeOptions.join(',')}`,
  },
});

const { value: dealName } = useField('dealName', undefined, { initialValue: '' });
const { value: loanAmount } = useField('loanAmount', undefined, { initialValue: '' });
const { value: productType } = useField('productType', undefined, { initialValue: '' });

const submitForm = handleSubmit(async (values) => {
  try {
    await $fetch('/api/airtable/Loan_Pipeline_Test', {
      method: 'POST',
      body: {
        dealName: values.dealName,
        loanAmount: values.loanAmount ? parseFloat(values.loanAmount) : null,
        productType: values.productType,
      },
    });
    resetForm();
    
    //Instead of 'alert', I used 'Toast' here.
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Loan added successfully!',
      life: 3000
    });
  } catch (error) {
    console.error('Submission error:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error adding loan. Please try again.',
      life: 5000
    });
  }
});
</script>

<template>
  <div class="form-container">
    <Toast />
    <h2>Add New Loan</h2>
    <form @submit.prevent="submitForm">
      <div class="p-field">
        <label for="dealName">Deal Name <span class="required-asterisk">*</span></label>
        <InputText
          id="dealName"
          v-model="dealName"
          :class="{ 'p-invalid': errors.dealName }"
          placeholder="Enter Deal Name"
        />
        <div v-if="errors.dealName" class="error">{{ errors.dealName }}</div>
      </div>
      <div class="p-field">
        <label for="loanAmount">Loan Amount <span class="required-asterisk">*</span></label>
        <InputText
          id="loanAmount"
          v-model="loanAmount"
          :class="{ 'p-invalid': errors.loanAmount }"
          placeholder="Enter Loan Amount"
        />
        <div v-if="errors.loanAmount" class="error">{{ errors.loanAmount }}</div>
      </div>
      <div class="p-field dropdown-field">
        <label for="productType">Product Type <span class="required-asterisk">*</span></label>
        <select
          id="productType"
          v-model="productType"
          :class="{ 'p-invalid': errors.productType }"
          class="custom-select"
        >
          <option value="" disabled>Select Product Type</option>
          <option v-for="option in productTypeOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        <div v-if="errors.productType" class="error">{{ errors.productType }}</div>
      </div>
      <div class="button-container">
        <Button type="submit" label="Submit" />
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  position: relative;
}

.p-field {
  margin-bottom: 1.5rem;
}

.dropdown-field {
  margin-bottom: 4rem !important;
  position: relative;
}

.button-container {
  margin-top: 2rem;
  position: relative;
  z-index: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
.custom-select {
  display: block !important;
  width: 100% !important;
  padding: 0.5rem !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  font-size: 1rem !important;
  background-color: white !important;
  color: #333 !important;
  min-height: 2.5rem !important;
  box-sizing: border-box !important;
  font-family: 'Poppins', sans-serif !important;
}

.custom-select:focus {
  outline: none !important;
  border-color: #007bff !important;
}

.custom-select option {
  padding: 0.5rem !important;
  font-size: 1rem !important;
}

.p-invalid {
  border-color: red;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.required-asterisk {
  color: red;
  margin-left: 2px;
}
</style>