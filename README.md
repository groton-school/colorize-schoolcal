# Colorize SchoolCal

Google Calendar Add-on to set the block color of events synced by SchoolCal

This Google Calendar Add-on searches your calendar for all events synced by SchoolCal from your myGroton Schedule. You can either opt to use pre-defined block colors to assign a color matching the block to your classes, or you can do your own custom search/color-assignment combination. (For example, search for "Advanced History" and color it "Pale Red".) The color palette is limited by the available event colors in Google Calendar.

## Install

[Refer to my gist on Google Workspace Add-on publication](https://gist.github.com/battis/6e32031196316acd1b5e5700b328aef6#file-readme-md) for general directions on how to administratively publish a Google Workspace Add-on.

This add-on is a `Google Workspace Add-on` in its GCP app configuration and uses the Google Calendar API (which should be automatically enabled when you configure the GCP project's OAuth scopes).

To ensure that you only edit events created by SchoolCal, you need to specify which Google Account is creating the SchoolCal-synced events. Make a copy of `env.example` and rename it `.env', and edit the `SERVICE_ACCOUNT` value to match your configuration.

## Tweaking colors/patterns

This script was written in about 15 minutes, and you may need to adjust it to your purposes. The list of color codes and Google Calendar colors is stored in the [`blocks`](https://github.com/groton-school/colorize-schoolcal/blob/5a6ca20b9970eb3cb06790fc0fea999958a63252/src/Calendar.ts#L3-L11) variable in [`src/Calendar.ts`](https://github.com/groton-school/colorize-schoolcal/blob/main/src/Calendar.ts). You can adjust the patterns and color assignments to suit your need. Note that you will need to quote patterns that include non-alphabetic characters.

```ts
const blocks = {
  'Red Block': '11',
  OR: '6',
  YL: '5',
  GR: '2',
  LB: '7',
  DB: '9',
  PR: '3'
};
```

The color codes are defined in the [Google Calendar documentation](https://developers.google.com/apps-script/reference/calendar/event-color) (and can be sneaked from [the menu-creation at the end of the script](https://developers.google.com/apps-script/reference/calendar/event-color) as well).

If you want to adjust how the pattern is matched, you will need to edit the snippet that is currently [` (${code}`](https://github.com/groton-school/colorize-schoolcal/blob/5a6ca20b9970eb3cb06790fc0fea999958a63252/src/Calendar.ts#L29) and therefor matching things like ` (RD`.

## Privacy Policy

This app collects and stores no data.

## Terms of Service

No license or warranty is provided or granted. Use at your own risk.
