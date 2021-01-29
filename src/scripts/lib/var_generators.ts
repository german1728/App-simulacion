import { jStat as st } from 'jstat';

export function Exponential(m:number, r:number[]) {
    return Array.from(r,x => (-m)*Math.log(1-x));
}

export function Uniform(a:number, b:number, r:number[]) {
    return Array.from(r,x=> a+((b-a)*x));
}

export function Empirical(r:number[]) {
    let res:number[]=[];
    for (let i=0;i<r.length;i++){
        res[i] = (r[i]> 0.5) ? 2*r[i] : Math.sqrt(2*r[i]);
    }
    return res;
}

export function Poisson(m:number, r:number[]) {
    let res:number[]=[],
        a:number[]=[],
        sum = 0;
    for (let i=0;i<r.length;i++){
        sum += st.poisson.cdf(i,m);
        a[i] = sum;
    }
    for(let i=0;i<r.length;i++){
        if(r[i]>0 && r[i]<a[0]) res[i] = 0;
        else{
            for(let j=1; j<=15;j++){
                if(r[i]>=a[j-1] && r[i]<a[j]){
                    res[i] = j; 
                    break;
                }
            }
        } 
    }
    return res;
}

export function Bernoulli(p:number, r:number[]) {
    let res:number[]=[];
    for (let i=0;i<r.length;i++){
        res[i] = (r[i]>0 && r[i]<(1-p)) ? 0 : 1;
    }
    return res;
}

export function noDensity(h:number[],r:number[]){
    let res:number[]=[];
    let unq = [...new Set(h)].sort();
    let c = unq.map(v => (h.filter(s => s===v).length)/h.length);
    let ac = c.map((sum => value => sum += value)(0));
    for(let i=0;i<r.length;i++){
        if(r[i]>=0 && r[i]<ac[0]) res[i] = unq[0];
        else{
            for(let j=1; j<unq.length;j++){
                if(r[i]>=ac[j-1] && r[i]<ac[j]){
                    res[i] = unq[j]; 
                    break;
                }
            }
        } 
    }
    return res;
}

export function Earlang(k:number, m:number, r:number[]) {
    let res:number[]=[];
    for(let i=0;i<r.length;i+=3){
        res[i/3]=(-(1/k)*m)*Math.log((1-r[i])*(1-r[i+1])*(1-r[i+2]));
    }
    return res;
}

export function Normal(m:number, de:number, r:number[]) {
    let res:number[]=[];
    let chunk = [...Array(r.length / 12)].map(_ => r.splice(0,12));
    for(let i=0;i<chunk.length;i++){
        res[i] = ((chunk[i].reduce((a,b) => a+b))-6)*de+m;
    }
    return res;
}

export function Binomial(n1:number, n2:number, p:number, r:number[]) {
    let res:number[]=[];
    for (let i=0;i<n1;i++){
        let s:number[]=[];
        for(let j=0;j<n2;j++){
            s[j] = (r[n1*i+j]>0 && r[n1*i+j]<(1-p)) ? 0 : 1;
        }
        res[i]= s.reduce((a,b) => a+b);
    }
    return res;
}