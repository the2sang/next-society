
async function getFromEndPoint<T>(endpoint: string): Promise<T> {
    const res = await fetch(process.env.PPA_BACKEND_URL + endpoint)
    const data = await res.json()
    return data
}

export const getPPAMailStatus = (mailStatus: string) =>
    getFromEndPoint<JSONPPATypes.TaxEmail[]>("/emailInfoSearch" + mailStatus)

export const getPPAIssueId = (issueId: string) =>
    getFromEndPoint<JSONPPATypes.TaxEmail[]>("/tax-email-issueId-search" + issueId)

export const getPPANotBatchAll = (fromDate: string, toDate:string) =>
    getFromEndPoint<JSONPPATypes.TaxEmail[]>(`/tax-email-statusIsNotNull-issueDay-search-noPage/${fromDate}/${toDate}`)




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