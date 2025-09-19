class ApiError extends Error{
    constructor(
        statusCode,
        mesasge ="Something went wrong",
        error=[],
        statck = ""
    ){
        super(mesasge)
        this.statusCode= statusCode,
        this.data= null,
        this.message = this.message,
        this.success =false,
        this.error= error

        if(statck){
            this.stack=statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError};