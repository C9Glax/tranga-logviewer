<template>
    <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-bind="$props"
        sticky
        :ui="{ td: 'p-0', th: 'px-1 py-2' }"
        :columns="columns">
        <template #thread-header>
            <UDropdownMenu
                v-if="!table?.tableApi?.getColumn('thread')?.getFilterValue()"
                :items="threadFilters">
                <UButton
                    trailing-icon="i-lucide-funnel"
                    color="neutral"
                    variant="ghost">
                    Thread
                </UButton>
            </UDropdownMenu>
            <UButton
                v-else
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-funnel-x"
                class="font-bold"
                @click="table?.tableApi?.getColumn('thread')?.setFilterValue(undefined)">
                Thread {{ table?.tableApi?.getColumn('thread')?.getFilterValue() }}
            </UButton>
        </template>
        <template #level-header>
            <UDropdownMenu
                v-if="!table?.tableApi?.getColumn('level')?.getFilterValue()"
                :items="levelFilters">
                <UButton
                    trailing-icon="i-lucide-funnel"
                    color="neutral"
                    variant="ghost">
                    Level
                </UButton>
            </UDropdownMenu>
            <UButton
                v-else
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-funnel-x"
                class="font-bold"
                @click="table?.tableApi?.getColumn('level')?.setFilterValue('')">
                {{ table?.tableApi?.getColumn('level')?.getFilterValue() }}
            </UButton>
        </template>
        <template #message-header> Message <UInput v-model="messageFilterModel" /> </template>
        <template #level-cell="{ row }">
            <UBadge
                :color="levelColor(row.original.level)"
                variant="soft">
                {{ row.original.level }}
            </UBadge>
        </template>
        <template #logger-cell="{ row }">
            <UTooltip :text="row.original.logger">
                {{ row.original.logger?.split('.').reverse()[0] }}
            </UTooltip>
        </template>
        <template #expand-cell="{ row }">
            <UButton
                @click="row.toggleExpanded()"
                variant="ghost"
                :class="['transition-transform', row.getIsExpanded() ? 'duration-200 rotate-180' : '']"
                aria-label="'Expand'"
                icon="i-lucide-chevron-down"
                square />
        </template>
        <template #expanded="{ row }">
            <UInput
                v-model="row.original.match"
                class="w-full pr-5 py-2"
                disabled
                :ui="{ trailing: 'pr-6' }">
                <template
                    v-if="row.original.match?.length"
                    #trailing>
                    <UTooltip
                        text="Copy to clipboard"
                        :content="{ side: 'right' }">
                        <UButton
                            :color="copied ? 'success' : 'neutral'"
                            variant="link"
                            size="sm"
                            :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                            aria-label="Copy to clipboard"
                            @click="copy(row.original.match)" />
                    </UTooltip>
                </template>
            </UInput>
        </template>
    </UTable>
</template>

<script setup lang="ts">
import type { TableColumn, TableProps } from '#ui/components/Table.vue';
import { useClipboard } from '@vueuse/core';
import { UButton } from '#components';
import type { DropdownMenuItem } from '#ui/components/DropdownMenu.vue';

const props = defineProps<TableProps<LogEntry>>();

const { copy, copied } = useClipboard();

export interface LogEntry {
    date?: string;
    level?: string;
    thread: string;
    logger?: string;
    message: string;
    match: string;
}

const columns: TableColumn<LogEntry>[] = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'thread', header: 'Thread' },
    { accessorKey: 'level', header: 'Level' },
    { accessorKey: 'logger', header: 'Logger' },
    { accessorKey: 'message', header: 'Message' },
    { id: 'expand' },
];

const levelColor = (
    level?: string
): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' | undefined => {
    switch (level?.toUpperCase()) {
        case 'INFO':
            return 'info';
        case 'DEBUG':
            return 'neutral';
        case 'WARN':
            return 'warning';
        case 'ERROR':
            return 'secondary';
        case 'FATAL':
            return 'error';
        default:
            return undefined;
    }
};

const table = useTemplateRef('table');
const levelFilter = { id: 'level', value: '' };
const threadFilter = { id: 'thread', value: '' };
const messageFilter = { id: 'message', value: '' };
const columnFilters = ref([levelFilter, threadFilter, messageFilter]);
const levelFilters = ref<DropdownMenuItem[]>(
    ['INFO', 'DEBUG', 'WARN', 'ERROR', 'FATAL'].map((level) => {
        return { label: level, onSelect: () => table.value?.tableApi?.getColumn('level')?.setFilterValue(level) };
    })
);
const threadFilters = computed(() =>
    (props.data?.map((l) => Number.parseInt(l.thread)).filter((value, index, array) => array.indexOf(value) === index) ?? []).sort((a,b) => a < b ? -1 : 1).map(
        (t) => {
            return {
                label: t?.toString(),
                onSelect: () => table.value?.tableApi?.getColumn('thread')?.setFilterValue(t?.toString()),
            };
        }
    )
);
const messageFilterModel = ref('');
watch(messageFilterModel, (val) => table.value?.tableApi?.getColumn('message')?.setFilterValue(val));
</script>
