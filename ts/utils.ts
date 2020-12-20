function debounce(func: (...args: any[]) => unknown, wait: number) {
    let timeout: number | undefined;

    const wrapper = function(this: any, ...args: any[]) {
        const later = () => {
            timeout = undefined;
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };

    wrapper.cancel = function() {
        clearTimeout(timeout);
        timeout = undefined;
    };

    return wrapper;
}
