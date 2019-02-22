const ServerOdgovori = {
    SERVER_ERROR : {
        success : null,
        data : 'Došlo je do greške na serveru aplikacije.'
    },

    BUILDSERVICE_ERROR : {
        success : null,
        data : 'Došlo je do greške pri radu sa servisom za evaluaciju rješenja.'
    },

    NO_TASKS : {
        success : null,
        data : 'Takmičenje nije moguće otvoriti dok se ne definišu takmičarski zadaci.'
    },

    NO_TESTS : {
        success : null,
        data : 'Takmičenje nije moguće otvoriti dok se ne definišu testovi za sve zadatke.'
    },

    NO_FILE : {
        success : null,
        data : 'Datoteka sa rješenjem nije pronađena.'
    },

    CSV_ERROR : {
        success : null,
        data : 'Došlo je do greške pri čitanju .csv datoteke.'
    },

    UNAUTHORIZED : {
        success : null,
        data : 'Nemate pravo na ovu opciju'
    }
}

module.exports = ServerOdgovori;