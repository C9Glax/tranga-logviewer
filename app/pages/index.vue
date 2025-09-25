<template>
    <UPage>
        <DataEntry
            v-model="logModel"
            class="w-fit" />
        <LogTable
            v-if="entries"
            class="h-full w-full absolute left-0 px-5"
            :data="entries" />
    </UPage>
</template>

<script setup lang="ts">
import type { DataModel } from '~/components/DataEntry.vue';
import type { LogEntry } from '~/components/LogTable.vue';

const logModel = useState<DataModel>(() => {
    return { pattern: '%date [%thread] %-5level %logger - %message%newline', logText: '' };
});

const entries = computed(() => logToEntries(logModel.value.logText, logModel.value.pattern));

const logToEntries = (text: string, pattern: string): LogEntry[] => {
    let regexPattern = makeSafeRegex(pattern);
    layoutVars.forEach((layoutVar) => {
        regexPattern = regexPattern.replaceAll(layoutVar.name, `(${layoutVar.regex})`);
    });
    const regex = RegExp(regexPattern, 'g');
    const order: string[] = layoutVars
        .map((layoutVar) => {
            return { index: text.indexOf(layoutVar.name), name: layoutVar.name };
        })
        .sort((a, b) => (a.index < b.index ? 1 : -1))
        .map((v) => v.name);

    const ret: LogEntry[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        ret.push(matchToEntry(match, order));
    }
    return ret;
};

const matchToEntry = (val: RegExpExecArray, order: string[]): LogEntry => {
    return {
        match: val[0],
        message: val[order.indexOf(messageLayout.name) + 1]!,
        date: val[order.indexOf(dateLayout.name) + 1],
        level: val[order.indexOf(levelLayout.name) + 1],
        thread: val[order.indexOf(threadLayout.name) + 1],
        logger: val[order.indexOf(loggerLayout.name) + 1],
    };
};

const makeSafeRegex = (input: string) => {
    const replaceVals: { val: string; replace: string }[] = [
        { val: '[', replace: '\\[' },
        { val: ']', replace: '\\]' },
        { val: '.', replace: '\\.' },
    ];
    replaceVals.forEach((replaceVal) => {
        input = input.replaceAll(replaceVal.val, replaceVal.replace);
    });
    return input;
};

const dateLayout: Layout = { name: '%date', regex: '\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2},\\d{3}' };
const threadLayout: Layout = { name: '%thread', regex: '\\d+' };

const levelLayout: Layout = { name: '%-5level', regex: 'DEBUG|INFO|ERROR|FATAL|WARN' };

const loggerLayout: Layout = { name: '%logger', regex: '[\\w\\.]+' };

const messageLayout: Layout = { name: '%message', regex: '.*' };

const newLine: Layout = { name: '%newline', regex: '\\n\\r?' };

const layoutVars: Layout[] = [dateLayout, threadLayout, levelLayout, loggerLayout, messageLayout, newLine];

interface Layout {
    name: string;
    regex: string;
}
</script>
