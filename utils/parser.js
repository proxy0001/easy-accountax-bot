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
        const matched = text.match(/(.+\D)(\d+) *$/);
        if (!matched) return illegal();
        const title = matched[1].trim();
        const amount = parseInt(matched[2]);
        const createDatetime = formatDatetime(getLocalTime());
        const items = '';
        return [title, items, amount, createDatetime];
    };
    const multiLines = function (text) {
        const matched = text.match(/(.+\D)(\d+) *$/);
        if (!matched) return illegal();
        const title = matched[1].trim();
        const amount = parseInt(matched[2]);
        const createDatetime = formatDatetime(getLocalTime());
        const items = '';
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