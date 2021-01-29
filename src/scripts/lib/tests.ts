import { jStat as st } from 'jstat';
import ksPPF from './ks';

export function M_test(numbers:number[]){
    let m:number = st.mean(numbers);
    let tl = .5 + (1.96 * (1 / Math.sqrt(12 * numbers.length)));
    let bl = .5 - (1.96 * (1 / Math.sqrt(12 * numbers.length)));
    return (m>= bl && m<=tl) ? true : false;
}

export function V_test(numbers:number[]){
    let v:number = st.variance(numbers,true);
    let tl = st.chisquare.inv(0.975, numbers.length-1)/(12*(numbers.length-1));
    let bl = st.chisquare.inv(0.025, numbers.length-1)/(12*(numbers.length-1));
    return (v>= bl && v<=tl) ? true : false;
}

export function chisquare_test(numbers:number[]){
    let m = ~~(Math.sqrt(numbers.length)); 
    let fe:number[] = new Array(m).fill((numbers.length/m));
    let fo:number[] = new Array(m).fill(0);
    numbers.forEach(n => fo[~~(n/(1/m))]++);
    let x = fe.map((n, i)=> (n - fo[i])**2/n).reduce((a,b) => a+b);
    return (x < st.chisquare.inv(0.95,m-1)) ? true : false;    
}

export function ks_test(numbers:number[]) {
    const sorted:number[] = [...numbers].sort((a, b) => a - b);
    let Dp = Math.max(...sorted.map((n,i) => ((i+1)/numbers.length)-n)); 
    let Dm = Math.max(...sorted.map((n,i) => (n-((i+1)/numbers.length))));
    let d = Math.max(Dp,Dm);
    return (d < ksPPF(numbers.length,0.05)) ? true : false;
}

export function ud_test(numbers:number[]) {
    const s:number[] = Array.from(numbers, (n,i) => (n > numbers[i+1]) ? 0 : 1);
    let c = s.filter( (v,i) => s[i-1] !== v ).length;
    let m = (2*numbers.length-1)/3;
    let v = (16*numbers.length-29)/90;
    let z = Math.abs((c-m)/Math.sqrt(v));
    return (z < 1.96) ? true : false;
}

export function udm_test(numbers:number[]) {
    const s:number[] = Array.from(numbers, n => (n > 0.5) ? 0 : 1);
    let c = s.filter( (v,i) => s[i-1] !== v ).length;
    let n0 = s.filter( v => v === 0 ).length;
    let n1 = s.filter( v => v === 1 ).length;
    let m = (2*n0*n1)/numbers.length + 0.5;
    let v = 2*n0*n1*(2*n0*n1-numbers.length)/(numbers.length**2*(numbers.length-1));
    let z = (c-m)/Math.sqrt(v);
    return (z <= 1.96 && z>= -1.96) ? true : false;
}

export function poker_test(numbers:number[]){
    let f = {'TD': 0, '1P': 0, '2P': 0, 'T': 0, 'TP': 0, 'P': 0, 'Q': 0};
    numbers.forEach( num => {
        let dig = Number(num).toFixed(5).slice(2).split("");
        let unq = [...new Set(dig)];
        let qt = Math.max(...unq.map(v => dig.filter(s => s===v).length));
        if (unq.length === 5)      f['TD']++;
        else if (unq.length === 4) f['1P']++;
        else if (unq.length === 1) f['Q']++;
        else if (unq.length === 3) (qt === 2) ? f['2P']++ : f['T']++;
        else if (unq.length === 2) (qt === 3) ? f['TP']++ : f['P']++;
    })
    let fo = Object.values(f);
    let fe = [0.3024,0.5040,0.1080,0.0720,0.0090,0.0045,0.0001].map(x => x * numbers.length);
    let z = fe.map((n,i)=> (fo[i]-n)**2/n).reduce((a,b) => a+b);
    return (z < st.chisquare.inv(0.95,6)) ? true: false;
}

export function gap_test(numbers:number[]){
    let f = {'0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5+': 0},
        a = 0.8,
        b = 1.0,
        s = Array.from(numbers, n => (n >= a && n <= b) ? 1 : 0).join(""),
        c = s.split('1').slice(1,-1),
        h = c.map(e => e.length);
    h.forEach(e => (e > 5) ? f['5+']++ : f[String(e)]++)
    let fo = Object.values(f),
        fe = Array.from({length:5},(v,i) => h.length * (b-a) *(1-(b-a)) ** (i));
    fe.push(h.length - fe.reduce((a,b) => a+b));
    const x = fe.map((n,i)=> (fo[i]-n)**2/n).reduce((a,b) => a+b);
    return (x <= st.chisquare.inv(0.95,5)) ? true : false;
}