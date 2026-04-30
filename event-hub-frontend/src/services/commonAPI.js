import axios from "axios";

const commonAPI = async(httpMethod,url,reqBody,reqHeader)=>{
        const reqConfig={
            method:httpMethod,
            url,
            data:reqBody,
            headers:reqHeader
        }
        //Api call using axios
        return await axios(reqConfig).then(res=>{
            return res
        })
        .catch(err=>{
            return err
        })
}

export default commonAPI