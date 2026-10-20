// Show each available meaning in the preferred language. Fall back only when
// that specific sense has no definition in the preferred language.
export function preferredMeanings<T extends {lang:string;meaningForms?:{meaningId:string}[]}>(rows:T[],language:string):T[] {
 const preferred=rows.filter(row=>row.lang===language);
 const covered=new Set(preferred.flatMap(row=>row.meaningForms?.map(form=>form.meaningId)||[]));
 return [...preferred,...rows.filter(row=>row.lang!==language&&(!row.meaningForms?.length||row.meaningForms.some(form=>!covered.has(form.meaningId))))];
}
