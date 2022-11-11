function parser (text) {
    if (!text) return [];
    const matched = text.match(/(.+\D)(\d+)$/);
    if (!matched) return [];
    const title = matched[1].trim();
    const amount = parseInt(matched[2]);
    const createDatetime = formatDatetime(getLocalTime());
    return [title, amount, createDatetime]
}

function getLocalTime () {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const datetimeLocal = new Date(now.getTime() - offsetMs);
    return datetimeLocal
}

function formatDatetime (datetime) {
    return datetime.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
}

module.exports = parser