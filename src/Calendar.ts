import g from '@battis/gas-lighter';

const colors = {
  'Pale Blue': '1',
  'Pale Green': '2',
  Mauve: '3',
  'Pale Red': '4',
  Yellow: '5',
  Orange: '6',
  Cyan: '7',
  Gray: '8',
  Blue: '9',
  Green: '10',
  Red: '11'
};

const blocks = {
  RD: colors.Red,
  OR: colors.Orange,
  YL: colors.Yellow,
  GR: colors.Green,
  LB: colors.Cyan,
  DB: colors.Blue,
  PR: colors.Mauve
};

function colorName(value) {
  return Object.keys(colors).find((key) => colors[key] === value);
}

const colorize = 'colorize';
global.colorize = ({
  parameters: { code = null },
  formInput: { query = null, color = null }
}) => {
  color = query && color;
  const user = Session.getActiveUser();
  const calendar = CalendarApp.getOwnedCalendarById(user.getEmail());
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() <= 6) {
    year = year - 1;
  }
  const events = calendar.getEvents(
    new Date(`${year}-09-01`),
    new Date(`${year + 1}-06-20`),
    { author: process.env.SERVICE_ACCOUNT, search: query || ` (${code}` }
  );
  events.forEach((event) => event.setColor(color || blocks[code]));
  return g.CardService.Navigation.replaceStack(onHomepage());
};

export function onHomepage() {
  const colorsSelect = CardService.newSelectionInput()
    .setTitle('color')
    .setFieldName('color')
    .setType(CardService.SelectionInputType.DROPDOWN);
  Object.keys(colors).forEach((color) =>
    colorsSelect.addItem(color, colors[color], false)
  );
  return g.CardService.Card.create({
    name: 'Colorize SchoolCal',
    sections: [
      g.CardService.Card.newCardSection({
        header: 'Set block Cclors',
        widgets: [
          CardService.newImage().setImageUrl(
            'https://groton-school.github.io/colorize-schoolcal/store/card-assets/card.png'
          ),
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
          colorsSelect,
          g.CardService.Widget.newTextButton({
            text: 'Colorize',
            functionName: colorize
          })
        ]
      })
    ]
  });
}
