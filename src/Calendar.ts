import g from '@battis/gas-lighter';

const blocks = {
    RD: '11',
    OR: '6',
    YL: '5',
    GR: '10',
    LB: '1',
    DB: '9',
    PR: '3',
};

export function onHomepage() {
    return g.CardService.Card.create({
        name: 'Colorize SchoolCal',
        widgets: Object.keys(blocks).map((code) =>
            g.CardService.Widget.newTextButton({
                text: `Colorize ${code}`,
                functionName: 'colorize',
                parameters: { code },
            })
        ),
    });
}

global.colorize = ({ parameters: { code } }) => {
    const user = Session.getActiveUser();
    const calendar = CalendarApp.getCalendarsByName(user.getEmail())[0];
    const events = calendar.getEvents(
        new Date('2023-01-01'),
        new Date('2023-06-30'),
        { author: 'schoolcal@groton.org', search: `- ${code}` }
    );
    events.forEach((event) => event.setColor(blocks[code]));
};
