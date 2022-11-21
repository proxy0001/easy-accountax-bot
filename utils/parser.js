const getLocalTime = function () {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const datetimeLocal = new Date(now.getTime() - offsetMs);
    return datetimeLocal;
};

const formatDatetime = function (datetime) {
    return datetime.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
};

const elimiter = ' ', newline = '\n';
const reduceAmount = [(acc, cur) => cur[1] ? acc + parseInt(cur[1]) : acc, 0]
const reduceItemsStr = [(acc, cur) => acc ? acc + newline + cur[0] + elimiter + cur[1] : cur[0] + elimiter + cur[1], '']

const processor = (function () {
    const illegal = function (text) {
        return []
    };
    const matchCoverage = function (matches) {
        if (matches.length === 0) return 0
        let matchedLen = 0
        let matchedStr = ''
        for(let i = 0; i < matches.length; i++) {
            matchedLen += matches[i][0].length
            matchedStr += matches[i][0]
        }
        return matchedLen / matches[0]['input'].replace(/\n/g, '').length
    };
    const extractor = function (text, regExp, titleHandler, collectionHandler) {
        const matches = [...text.trim().matchAll(regExp)];
        if (!matches.length) return illegal();
        if (matchCoverage(matches) !== 1) return illegal();
        let title = '', collection = [];
        for (const [index, match] of [...matches].entries()) {
            trimedMatch = match.map(x => x && typeof x.trim === 'function' ? x.trim() : x)
            title = titleHandler(index, trimedMatch, title)
            collection = collectionHandler(index, trimedMatch, collection)
        }
        const amount = collection.reduce(...reduceAmount);
        const items = collection.reduce(...reduceItemsStr);
        const createDatetime = formatDatetime(getLocalTime());
        return [title, items, amount, createDatetime];
    };
    const oneLineWithEmptyTitle = function (text) {
        return extractor(text, /(\D+)(\d+)/gm, (index, match, title) => '', (index, match, collection) => {
            if (match[2]) collection.push([match[1], match[2]])
            return collection
        })
    };
    const oneLineWithStrictMode = function (text) {
        return extractor(text, /^([^ ]*) +([^ ]*\D)(\d+) +|([^ ]*) +(\d+)| +(.*[^ ]*) +(\d+)/gm, (index, match, title) => {
            return index === 0 && match[1] ? match[1] : title
        }, (index, match, collection) => {
            if (index !== 0 && match[1]) collection.push([match[1], ''])
            if (match[3]) collection.push([match[2], match[3]])
            if (match[5]) collection.push([match[4], match[5]])
            if (match[7]) collection.push([match[6], match[7]])
            return collection
        })
    };
    const oneLine = function (text) {
        return extractor(text, /^([^ ]*) +([^ ]*\D)(\d+)| +([^ ]*) +(\d+)| +(\D+)(\d+)/gm, (index, match, title) => {
            return index === 0 && match[1] ? match[1] : title
        }, (index, match, collection) => {
            if (index !== 0 && match[1]) collection.push([match[1], ''])
            if (match[3]) collection.push([match[2], match[3]])
            if (match[5]) collection.push([match[4], match[5]])
            if (match[7]) collection.push([match[6], match[7]])
            return collection
        })
    };
    const multiLines = function (text) {
        return extractor(text, /(.+\D)(\d+) *$|(.*[\D^ *]) *$/gm, (index, match, title) => {
            return index === 0 && match[3] ? match[3] : title
        }, (index, match, collection) => {
            if (index !== 0 && match[3]) collection.push([match[3], ''])
            if (match[2]) collection.push([match[1], match[2]])
            return collection
        })
    };
    const executionMethods = {
        illegal,
        oneLineWithEmptyTitle,
        oneLineWithStrictMode,
        oneLine,
        multiLines,
    };
    const exec = function (name) {
        if (!(executionMethods[name] instanceof Function)) throw new Error('There is no corresponding execution method for the plan.')
        return executionMethods[name]
    }
    const iterativelyExec = function (plan) {
        return (text) => {
            for (let i = 0;i < plan.length; i++) {
                const res = exec(plan[i])(text);
                if (!res.length) continue;
                else return res;
            }
            return exec('illegal')(text);
        }
    }
    return function (plan) {
        if (typeof plan === 'string') return exec(plan)
        if (Array.isArray(plan)) return iterativelyExec(plan)
        throw new Error('type error of plan, which accept String and Array')
    };
})();

const planner = function (text) {
    if (!text) return 'illegal';
    if (/\r|\n/.exec(text)) return 'multiLines';
    else return ['oneLineWithStrictMode', 'oneLine', 'oneLineWithEmptyTitle'];
}

const parser = function (text) {
    return processor(planner(text))(text)
}

module.exports = parser;