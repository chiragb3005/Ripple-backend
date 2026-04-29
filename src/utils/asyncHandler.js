// when talking to DB this handles fails and success cases


// there can be two asyncHandler 
// 1. Promise
// 2. try-catch

// here requestHandler is a function ill call later
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}




export { asyncHandler };

// this will be a higher order function


// const asyncHandler = (fn) => {
//     return async (req, res, next) => {
//         try {
//             await fn(req, res, next)
//         } 
//         catch (err) {
//             // when error occurs
//             // sending the response as json so frontend have ease
//             res.status(err.code || 500).json({
//                 sucess:false, 
//                 message:err.message
//             })
//         }
//     }
// }