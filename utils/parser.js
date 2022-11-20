const getLocalTime = function () {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const datetimeLocal = new Date(now.getTime() - offsetMs);
    return datetimeLocal;
};

const formatDatetime = function (datetime) {
    return datetime.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
};

const processor = (function () {
    const illegal = function (text) {
        return []
    };
    const singleLine = function (text) {
        const matched = text.trim().match(/(.+\D)(\d+) *$/);
        if (!matched) return illegal();
        const title = matched[1].trim();
        const amount = parseInt(matched[2]);
        const createDatetime = formatDatetime(getLocalTime());
        const items = '';
        return [title, items, amount, createDatetime];
    };
    const multiLines = function (text) {
        const matched = text.trim().matchAll(/(.+\D)(\d+) *$|(.*[\D^ *]) *$/gm);
        if (!matched) return illegal();
        let title = '', items = '', amount = 0;
        const elimiter = ' ', newline = '\n';
        const createDatetime = formatDatetime(getLocalTime());
        const collection = []
        for (const [index, match] of [...matched].entries()) {  
            if (index === 0 && match[3]) title = match[3].trim()
            if (index !== 0 && match[3]) collection.push([match[3].trim(), ''])
            if (match[2]) collection.push([match[1].trim(), match[2].trim()])
        }
        amount = collection.reduce((acc, cur) => cur[1] ? acc + parseInt(cur[1]) : acc, 0)
        items = collection.reduce((acc, cur) => acc ? acc + newline + cur[0] + elimiter + cur[1] : cur[0] + elimiter + cur[1], '')
        return [title, items, amount, createDatetime];
    };
    const executions = {
        illegal,
        singleLine,
        multiLines,
    };
    return function (plan) {
        if (!(executions[plan] instanceof Function)) throw new Error('There is no corresponding execution method for the plan.')
        return executions[plan]
    };
})();

const planner = function (text) {
    if (!text) return 'illegal';
    if (/\r|\n/.exec(text)) return 'multiLines';
    else return 'singleLine';
}

const parser = function (text) {
    return processor(planner(text))(text)
}

module.exports = parser;