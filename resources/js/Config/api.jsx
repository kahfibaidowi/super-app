import { router } from "@inertiajs/react"
import { QueryClient } from "@tanstack/react-query"

export const queryClient=new QueryClient({
    defaultOptions:{
        queries:{
            retry:3,
            throwOnError:err=>{
                if(err.response.status==401){
                    router.visit("/")
                }
            }
        }
    }
})