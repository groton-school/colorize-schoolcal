import g from '@battis/gas-lighter';

const blocks = {
  RD: '11',
  OR: '6',
  YL: '5',
  GR: '2',
  LB: '7',
  DB: '9',
  PR: '3'
};

const colorize = 'colorize';
global.colorize = ({
  parameters: { code = null },
  formInput: { query = null, color = null }
}) => {
  color = query && color;
  const user = Session.getActiveUser();
  const calendar = CalendarApp.getCalendarsByName(user.getEmail())[0];
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() <= 6) {
    year = year - 1;
  }
  const events = calendar.getEvents(
    new Date(`${year}-09-01`),
    new Date(`${year + 1}-06-20`),
    { author: process.env.SERVICE_ACCOUNT, search: query || `- ${code}` }
  );
  events.forEach((event) => event.setColor(color || blocks[code]));
  return g.CardService.Navigation.replaceStack(onHomepage());
};

export function onHomepage() {
  return g.CardService.Card.create({
    name: 'Colorize SchoolCal',
    sections: [
      g.CardService.Card.newCardSection({
        header: 'Set block Cclors',
        widgets: [
          'Set the color of synced events based on standard block colors.',
          ...Object.keys(blocks).map((code) =>
            g.CardService.Widget.newTextButton({
              text: `Colorize ${code}`,
              functionName: colorize,
              parameters: { code }
            })
          )
        ]
      }),
      g.CardService.Card.newCardSection({
        header: 'Set arbitrary colors',
        widgets: [
          'Set the color of all synced events based on a search query.',
          '<b>Caution:</b> too broad a query will time out and fail!',
          CardService.newTextInput()
            .setTitle('search query')
            .setFieldName('query'),
          CardService.newSelectionInput()
            .setTitle('color')
            .setFieldName('color')
            .setType(CardService.SelectionInputType.DROPDOWN)
            .addItem('Pale Blue', '1', false)
            .addItem('Pale Green', '2', false)
            .addItem('Mauve', '3', false)
            .addItem('Pale Red', '4', false)
            .addItem('Yellow', '5', false)
            .addItem('Orange', '6', false)
            .addItem('Cyan', '7', false)
            .addItem('Gray', '8', false)
            .addItem('Blue', '9', false)
            .addItem('Green', '10', false)
            .addItem('Red', '11', false),
          g.CardService.Widget.newTextButton({
            text: 'Colorize',
            functionName: colorize
          })
        ]
      })
    ]
  });
}
