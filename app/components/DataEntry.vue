<template>
    <UModal>
        <UButton
            label="Load"
            color="neutral"
            variant="subtle" />

        <template #content>
            <UPageCard>
                <p>Pattern to match:</p>
                <UInput
                    v-model="model.pattern"
                    :placeholder="'Pattern'"
                    class="w-full" />
                <p>Logfile:</p>
                <UTextarea
                    v-model="model.logText"
                    :rows="10"
                    :maxrows="10"
                    autoresize
                    :placeholder="'Log...'" />
            </UPageCard>
        </template>
    </UModal>
</template>

<script setup lang="ts">
export interface DataModel {
    pattern: string;
    logText: string;
}

const model = defineModel<DataModel>({
    required: true,
    default: { pattern: '%date [%thread] %-5level %logger - %message%newline', logText: '' },
});
</script>
