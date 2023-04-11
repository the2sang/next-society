
async function getFromEndPoint<T>(endpoint: string): Promise<T> {

    //console.log(process.env["PPA_BACKEND_URL "])

    //const res = await fetch(process.env.PPA_BACKEND_URL + endpoint)
    const res = await fetch("http://localhost:9094/api" + endpoint)

    if (res.statusText === '404') throw Error ("404 Error")

    if (!res.ok) throw new Error(`Error! status: ${res.status}`)

    const data = await res.json()
    //console.log(data)

    return data

}

export const getPPAMailStatus = (mailStatus: string) =>
    getFromEndPoint<JSONPPATypes.TaxEmail[]>("/emailInfoSearch" + mailStatus)

//국세청 승인번호로 검색
export const getPPAIssueId = (issueId: string) =>
    getFromEndPoint<JSONPPATypes.TaxEmail[]>("/tax-email-issueId-search/" + issueId)

//사업자번호로 검색
export const getPPASaupNo = (saupNo: string) =>
    getFromEndPoint<JSONPPATypes.TaxEmail[]>("/tax-email-invoicerPartyId-search/" + saupNo)


//배치처리 완료로 검색 (mail status code is not null)
export const getPPABatchAll = (fromDate: string, toDate:string) =>
    getFromEndPoint<JSONPPATypes.TaxEmail[]>(`/tax-email-statusIsNotNull-issueDay-search-noPage/${fromDate}/${toDate}`)

//배치처리 미실행으로 검색 (mail status code is null)
export const getPPANotBatchAll = (fromDate: string, toDate:string) =>
    getFromEndPoint<JSONPPATypes.TaxEmail[]>(`/tax-email-statusIsNull-issueDay-search-noPage/${fromDate}/${toDate}`)

export declare namespace JSONPPATypes {

    interface TaxEmail {
        issueId: string,
        issueDay: string,
        invoicerPartyId: string,
        invoicerAddr: string,
        invoiceeTaxRegistId: string,
        chargeTotalAmount: number,
        taxTotalAmount: number,
        mailStatusCode: string
    }
}