import g from '@battis/gas-lighter';
import Calendar from '@battis/google.calendar';

const COLOR_NAMES = {
  'Pale Blue': CalendarApp.EventColor.PALE_BLUE,
  'Pale Green': CalendarApp.EventColor.PALE_GREEN,
  Mauve: CalendarApp.EventColor.MAUVE,
  'Pale Red': CalendarApp.EventColor.PALE_RED,
  Yellow: CalendarApp.EventColor.YELLOW,
  Orange: CalendarApp.EventColor.ORANGE,
  Cyan: CalendarApp.EventColor.CYAN,
  Gray: CalendarApp.EventColor.GRAY,
  Blue: CalendarApp.EventColor.BLUE,
  Green: CalendarApp.EventColor.GREEN,
  Red: CalendarApp.EventColor.RED
};

const BLOCK_COLORS = {
  RD: CalendarApp.EventColor.RED,
  OR: CalendarApp.EventColor.ORANGE,
  YL: CalendarApp.EventColor.YELLOW,
  GR: CalendarApp.EventColor.GREEN,
  LB: CalendarApp.EventColor.CYAN,
  DB: CalendarApp.EventColor.BLUE,
  PR: CalendarApp.EventColor.MAUVE,
  'W)': CalendarApp.EventColor.BLUE,
  'X)': CalendarApp.EventColor.YELLOW,
  'Y)': CalendarApp.EventColor.ORANGE,
  'Z)': CalendarApp.EventColor.GREEN,
  WX: CalendarApp.EventColor.BLUE,
  YZ: CalendarApp.EventColor.ORANGE
};

const MAX_BATCH_REQUESTS = 50; // undocumented

const now = new Date();
let year = now.getFullYear();
if (now.getMonth() <= 6) {
  year = year - 1;
}
const EVENT_WINDOW_START = `June 15, ${year} 12:00 AM EDT`;
const EVENT_WINDOW_END = `June 15, ${year + 1} 12:00 AM EDT`;

const colorize = 'colorize';
global.colorize = ({ formInput: { query = null, color = null } }) => {
  color = query && color;
  const user = Session.getActiveUser();
  const calendar = CalendarApp.getOwnedCalendarById(user.getEmail());
  const timeMin = new Date(EVENT_WINDOW_START).toISOString();
  const timeMax = new Date(EVENT_WINDOW_END).toISOString();
  let requests: GoogleAppsScript.URL_Fetch.URLFetchRequest[] = [];
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendar.getId()}/events?eventTypes=default&timeMin=${timeMin}&timeMax=${timeMax}&q=${
    process.env.SERVICE_ACCOUNT
  }`;

  let response: Calendar.v3.Events;

  do {
    response = JSON.parse(
      UrlFetchApp.fetch(
        url +
          (response && response.nextPageToken
            ? `&pageToken=${response.nextPageToken}`
            : ''),
        {
          method: 'get',
          headers: {
            Authorization: `Bearer ${ScriptApp.getOAuthToken()}`
          }
        }
      ).getContentText()
    );

    const events = response.items;
    delete response.items;

    for (let i = 0; i < events.length; i++) {
      if (query === null || events[i].summary.indexOf(query) >= 0) {
        let colorId: string = color;
        if (!query) {
          const code = events[i].summary.match(/.*\(([A-Z]{2,2})[^)]*\)$/);
          if (code?.length > 0 && Object.hasOwn(BLOCK_COLORS, code[1]))
            colorId = BLOCK_COLORS[code[1]];
        }
        if (colorId && colorId != events[i].colorId) {
          requests.push({
            method: 'patch',
            url: `https://www.googleapis.com/calendar/v3/calendars/${calendar.getId()}/events/${
              events[i].id
            }`, // getId() is returning the (related) iCalUID, apparently
            payload: { colorId }
          });
          if (requests.length === MAX_BATCH_REQUESTS) {
            requests = batch(requests);
          }
        }
      }
    }
  } while (response.nextPageToken);
  if (requests.length) {
    batch(requests);
  }
  return g.CardService.Navigation.replaceStack(onHomepage());
};

function batch(requests: GoogleAppsScript.URL_Fetch.URLFetchRequest[]) {
  const EOL = '\r\n';
  const payload = requests.map((request) => {
    const requestPayload = JSON.stringify(request.payload);
    return (
      'Content-Type: application/json' +
      EOL +
      `Content-Length: ${requestPayload.length}` +
      EOL +
      `Content-ID: ${request.url.replace(/.*\/(.+)$/, '$1')}` +
      EOL +
      EOL +
      `${(request.method || 'get').toUpperCase()} ${request.url.replace(
        /^https:\/\/www\.googleapis\.com/,
        ''
      )}` +
      EOL +
      EOL +
      requestPayload +
      EOL
    );
  });
  const separator = 'batch_item';
  const request: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    headers: {
      Authorization: `Bearer ` + ScriptApp.getOAuthToken(),
      'Content-Type': `multipart/mixed; boundary=${separator}`
    },
    payload:
      `--${separator}` +
      EOL +
      payload.join(EOL + `--${separator}` + EOL) +
      EOL +
      `--${separator}--`
  };
  UrlFetchApp.fetch('https://www.googleapis.com/batch/calendar/v3', request);

  return [];
}

export function onHomepage() {
  const colorsSelect = CardService.newSelectionInput()
    .setTitle('color')
    .setFieldName('color')
    .setType(CardService.SelectionInputType.DROPDOWN);
  Object.keys(COLOR_NAMES).forEach((color) =>
    colorsSelect.addItem(color, COLOR_NAMES[color], false)
  );
  return g.CardService.Card.create({
    name: 'Colorize SchoolCal',
    sections: [
      g.CardService.Card.newCardSection({
        header: 'Set block colors',
        widgets: [
          CardService.newImage().setImageUrl(
            'https://groton-school.github.io/colorize-schoolcal/store/card-assets/card.png'
          ),
          'Set the color of synced events based on standard block colors.',
          g.CardService.Widget.newTextButton({
            text: 'Colorize Blocks',
            functionName: colorize
          })
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
