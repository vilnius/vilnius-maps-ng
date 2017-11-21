import { Angular2EsriExamplePage } from './app.po';

describe('angular2-esri-example App', function() {
  let page: Angular2EsriExamplePage;

  beforeEach(() => {
    page = new Angular2EsriExamplePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
