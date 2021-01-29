import DataFrame from 'dataframe-js';
import * as prng from './lib/prn_generators';
import * as t from './lib/tests';
import * as varg from './lib/var_generators';

const generateData = (generator:string, count:number, seed:string = ((Date.now() / 1000 | 0).toString())) => {
   switch (generator){
       case '1': return prng.MSM_generator(seed,count); 
       case '2': return prng.MPM_generator(seed,count);
       case '3': return prng.CM_generator(seed,count);
       case '4': return prng.LC_generator(seed,count);
       case '5': return prng.MC_generator(seed,count);
       case '6': return prng.AC_generator(count);
       case '7': return prng.QC_generator(seed,count);
       case '8': return prng.BBS_generator(seed,count);
   }                                   
}

interface testsConfig {
    "de las medias" ?: boolean; 
    "de la varianza" ?: boolean;
    "Chi-cuadrada" ?: boolean;
    "Kolmogorov-Smirnov" ?: boolean;
    "de corridas arriba y abajo" ?: boolean;
    "de corridas arriba y abajo de la media" ?: boolean;
    "de Poker" ?: boolean;
    "de huecos" ?: boolean;
}

const testData = (data:number[], test:string[]) => {
    let test_results = {} as testsConfig;
    test.forEach( tst => {
        switch (tst){
            case '1': test_results["de las medias"] = t.M_test(data); break;
            case '2': test_results["de la varianza"] = t.V_test(data); break;
            case '3': test_results["Chi-cuadrada"] = t.chisquare_test(data); break;
            case '4': test_results["Kolmogorov-Smirnov"] = t.ks_test(data); break;
            case '5': test_results["de corridas arriba y abajo"] = t.ud_test(data); break;
            case '6': test_results["de corridas arriba y abajo de la media"] = t.udm_test(data); break;
            case '7': test_results["de Poker"] = t.poker_test(data); break;
            case '8': test_results["de huecos"] = t.gap_test(data); break;
        }
    })
    return test_results;
}

const exportToCSV = (data:number[]) => {
    const df = new DataFrame({column: data}, ['numero']);
    return df.toCSV(true);
}

const importFromCSV = (file: File) => new DataFrame.fromCSV(file).then(df => [].concat(...df.toArray()));

//MAIN

let generatedNumbers:number[];
const form2 = document.getElementById('form_2'),
      file = document.getElementById('prng-file'),
      download = document.getElementById('download'),
      form1 = document.getElementById('form_1');

form1.addEventListener('submit', (e) => {
    e.preventDefault();
    generatedNumbers = generateData((<HTMLFormElement>e.target).generator.value, (<HTMLFormElement>e.target).cant.value);
    alert('Numeros generados');
    download.removeAttribute('disabled');
    document.getElementById('ng').removeAttribute('style');
})

form2.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const numbers:number[] = ((<HTMLInputElement>document.getElementById('import')).checked) ? await importFromCSV((<HTMLInputElement>file).files[0]) : generatedNumbers;
        let selectedTests = [...document.querySelectorAll('.tst:checked')].map(v => (<HTMLInputElement>v).value),
            res = testData(numbers, selectedTests),
            box = document.querySelector('.res ul'),
            frag = document.createDocumentFragment();
        box.innerHTML = "";
        Object.entries(res).forEach(([key, val]) => {
            let li = document.createElement('li');
            li.textContent = `Los numeros ${(val) ? "superaron" : "no superaron"} la prueba ${key}`;
            frag.appendChild(li);
        })
        box.appendChild(frag);
    } catch (error) {
        alert("Error: No se ha importado ningun archivo")
    }
})

download.addEventListener('click', () => {
    let a = document.createElement('a'),
        blob = new Blob([exportToCSV(generatedNumbers)], {type: 'text/csv'}),
        url = URL.createObjectURL(blob);
    a.setAttribute('href', url);
    a.setAttribute('download', 'numerosPseudoaletorios.csv');
    a.click();
})
