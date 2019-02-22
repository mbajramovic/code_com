module.exports = {
    getEkstenzija : function(jezik) {
        switch(jezik.toLowerCase()) {
            case 'c':
                return '.c';
            case 'c++':
                return '.cpp';
            case 'c#':
                return '.cs';
            case 'java':
                return '.java';
            case 'pascal':
                return '.pas';
            case 'basic':
                return '.bas';
            case 'qbasic':
                return '.bas';
            default:
                return 'Nepoznato';

        }
    }
}