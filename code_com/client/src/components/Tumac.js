module.exports = {
    compileTumac : function(status) {
        var rez = '';
       // status = status == null ? '' : status;
        switch(status) {
            case 1: 
                rez = 'Program se uspješno kompajlira.';
                break;
            case 2:
                rez = 'Program se ne može kompajlirati.';
                break; 
        }

        return rez;
    },

    runTumac : function(status) {
        var rez = '';
        switch(status) {
            case 1:
                rez = 'Program se uspješno izvršio.';
                break;
            case 2:
                rez = 'Program se predugo izvršavao.';
                break;
            case 3:
                rez = 'Program se krahirao.';
                break;
            
        }
        return rez;
    },

    testTumac : function(status) {
        var rez = '';
        switch(status) {
            case 1: 
                rez = 'Test je prošao.';
                break;
            case 2:
                rez = 'Test symbol not found.';
                break;
            case 3:
                rez = 'Test se ne može kompajlirati.';
                break;
            case 4: 
                rez = 'Test se predugo izvršavao.';
                break;
            case 5:
                rez = 'Krahiranje.';
                break;
            case 6:
                rez = 'Dobijeni rezultat ne odgovara očekivanom.';
                break;
            case -1:
                rez = 'Program se ne kompajlira.';
                break;
        }

        return rez;
    },

    glavniTumac : function(status) {
        var rez = '';
        switch(status) {
            case 1: 
                rez = 'Program čeka na testiranje.';
                break;
            case 2:
                rez = 'Test symbol not found.';
                break;
            case 3:
                rez = 'Program se ne može kompajlirati.';
                break;
            case 4: 
                rez = 'Testiranje je završeno.';
                break;
            case 5:
                rez = '';
                break;
            case 6:
                rez = '';
                break;
            case 7:
                rez = 'Program se trenutno testira.';
                break;

        }
        return rez;
    }
}