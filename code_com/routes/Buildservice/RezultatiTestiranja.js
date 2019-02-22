module.exports = {

    glavniRezultat : function(status) {
        var rezultat = '';
        switch(status) {
            case 1:
                rezultat = 'Program čeka na testiranje...';
                break;
            case 3:
                rezultat = 'Program se ne može kompajlirati.';
                break;
            case 5:
                rezultat = '';
                break;
            case 7:
                rezultat = "Program se trenutno testira...";
                break;
        }

        return rezultat;
    }
}