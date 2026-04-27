// const asyncHandler = () => {}
// const asyncHandler = (fn) => {} => {}
// const asyncHandler = (fn) => async () => {}

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};
 
const asyncHandlerWithPromise = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch((error) => next(error));
    };
};

export default asyncHandler;
export { asyncHandlerWithPromise };
