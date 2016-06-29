import React from 'react';
import { ApolloProvider, connect } from 'react-apollo';
import { Pagination, ListGroupItem } from 'react-bootstrap';
import autobind from 'autobind-decorator';

import { mapQueriesToProps } from '../../api/docs/query';
import { Client } from '../../modules/apollo-client';

const DOCS_PER_PAGE = 5;
const PAGES_PER_FETCH = 2;
const MIN_DOCS_PER_FETCH = DOCS_PER_PAGE * PAGES_PER_FETCH;

const CLIENT_HEIGHT_BUFFER = 100;
const PAGE_DELAY = 250;
const ADD_ONSCROLL_DELAY = 500;

const MAX_BUTTONS = 10;

const mapStateToProps = function(state, ownProps) {
  return {
    offset: 0,
    limit: MIN_DOCS_PER_FETCH,
  }
};

@autobind
class Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      count: 0,
      numbPages: 0,
      activePage: 0,
      highestOddIdx: 0,
      elements: [],
    };
  }

  // LIFECYCLE METHODS

  // only fires on new data from server
  componentWillReceiveProps(nextProps) {
    if (!nextProps.getNames.loading){
      const newState = {
        documents: nextProps.getNames.fullNames.rows,
        count: nextProps.getNames.fullNames.count
      };

      // if coming from initial load
      if (!this.state.elements.length)
        newState.activePage = 1;
      // else if clicked nav page button
      else if (this.clickedPage)
        newState.activePage = this.clickedPage;

      this.isLoading = false;
      this.addNewResults(newState);
    }
    else
    {
      const c = this.getDocsContainer();
      c.onscroll = undefined;
      this.isLoading = true;
    }
  }

  // end here if scrolling
  componentDidUpdate(prevProps, prevState) {
    if(!this.isLoading){
      if(!prevState.elements.length || this.clickedPage){
        this.clickedPage = undefined;
        this.scrollToPosition();
      }
      else
        this.setScrollTimeout();
    }
  }

  // UTILITY METHODS

  addNewResults(results) {
    const numbPages = Math.ceil(results.count / DOCS_PER_PAGE);
    const newElements = this.buildElements(results.documents);
    const allElements = this.state.elements.concat(newElements);
    const newState = { count: results.count, numbPages, elements: allElements };
    const oddIdxDiff = newElements.length / MIN_DOCS_PER_FETCH;

    if (results.activePage)
      newState.activePage = results.activePage;

    if (this.state.elements.length)
      newState.highestOddIdx = (this.state.highestOddIdx + oddIdxDiff);

    this.setState(newState);
  }

  buildElements(arr) {
    const elements = [];
    arr.map(obj => elements.push(
      <ListGroupItem key={obj.id} className="individualDoc" header={obj.name} href="#">
        {`id ${obj.id}`}
      </ListGroupItem>
    ));
    return elements;
  }

  getDocsContainer() {
    return document.getElementById('docsContainer');
  }

  // only if nav button clicked
  scrollToPosition() {
    const c = this.getDocsContainer();
    const pixelsPerPage = this.pixelsPerPg(c.scrollHeight);
    const topOfPage = pixelsPerPage * (this.state.activePage - 1);

    if (topOfPage !== c.scrollTop)
      c.scrollTop = topOfPage;

    // add the onscroll handler after short delay
    setTimeout(() => (c.onscroll = this.setScrollTimeout.bind(this)), ADD_ONSCROLL_DELAY);
  }

  pixelsPerPg(scrollHeight) {
    const pixelsPerDoc = (scrollHeight / this.state.elements.length);
    return (pixelsPerDoc * DOCS_PER_PAGE);
  }

  // end here if nav button clicked
  // start here if scrolling
  setScrollTimeout() {
    // wait for timeout before adding handler again
    if (!this.scrollTimeout) {
      const callback = () => {
        this.scrollTimeout = undefined;
        this.refetchOrSetActivePage();
      };

      this.scrollTimeout = setTimeout(callback, PAGE_DELAY);
    }
  }

  // only if scrolling
  refetchOrSetActivePage() {
    const elemLength = this.state.elements.length;
    const c = this.getDocsContainer();
    const pixelsUntilDone = (c.scrollHeight - c.scrollTop);

    if (elemLength < this.state.count) {
      const viewPortAndBuffer = (c.clientHeight + CLIENT_HEIGHT_BUFFER);
      const shouldRefetch = (pixelsUntilDone < viewPortAndBuffer);

      if (shouldRefetch)
        // load minimum because this is triggered by scrolling
        this.props.getNames.refetch({offset:elemLength,limit:MIN_DOCS_PER_FETCH});
      else
        this.setActivePage(pixelsUntilDone);
    }
    else
      this.setActivePage(pixelsUntilDone);
  }

  // only if scrolling
  // setting the active page nav button is separate from loading new results
  setActivePage(pixelsUntilDone) {
    const c = this.getDocsContainer();
    const pixelsPerPage = this.pixelsPerPg(c.scrollHeight);

    const done = (pixelsUntilDone === c.clientHeight);
    const onLastPage = (this.state.activePage === this.state.numbPages);

    const prevPg = (this.state.activePage - 1);
    const endPixelForPrevPg = (pixelsPerPage * prevPg);
    const beginPixelForNxPg = (pixelsPerPage * this.state.activePage);

    const shouldGoBack = (c.scrollTop < (endPixelForPrevPg - CLIENT_HEIGHT_BUFFER));
    const shouldGoForward = (c.scrollTop > (beginPixelForNxPg - CLIENT_HEIGHT_BUFFER));

    // if going forward, how many pages?
    // this logic is neccesary because of variable scroll speed
    const nonZeroScrollTop = c.scrollTop ? c.scrollTop : 1;
    const newCurrPgNoBuffer = Math.ceil(nonZeroScrollTop / pixelsPerPage);
    const endPixelForNewCurrPgNoBuffer = (pixelsPerPage * newCurrPgNoBuffer);
    const addPageForBuffer = (CLIENT_HEIGHT_BUFFER > (endPixelForNewCurrPgNoBuffer - c.scrollTop));

    const newCurrPg = addPageForBuffer ? (newCurrPgNoBuffer + 1) : newCurrPgNoBuffer;
    const newNxPg = (newCurrPg + 1);

    const beginPixelForNewNxPg = (pixelsPerPage * newCurrPg);
    const shouldGoForwardToNewNxPg = (c.scrollTop > (beginPixelForNewNxPg - CLIENT_HEIGHT_BUFFER));

    if (shouldGoBack)
      this.setState({ activePage: newCurrPg });
    else if (done && !onLastPage)
      this.setState({ activePage: this.state.numbPages });
    else if (shouldGoForward)
      this.setState({ activePage: shouldGoForwardToNewNxPg ? newNxPg : newCurrPg });
    else if(!c.onscroll)
      c.onscroll = this.setScrollTimeout.bind(this);
  }

  // start here if nav button clicked
  pageFromNav(newPage) {
    if (typeof newPage === 'number') {
      const c = this.getDocsContainer();
      const newOddIdx = this.getOddIdx(newPage);

      // would prefer to pass 'newPage' to componentWillReceiveProps, but don't know how...
      this.clickedPage = newPage;
      c.onscroll = undefined;

      // if loading more results
      if (newOddIdx > this.state.highestOddIdx) {
        const elemLength = this.state.elements.length;
        const newLimit = (newOddIdx - this.state.highestOddIdx) * MIN_DOCS_PER_FETCH;

        // load an amount based on new page
        this.props.getNames.refetch({offset:elemLength,limit:newLimit});
      }
      else
        this.setState({ activePage: newPage });
    }
  }

  // odd index is the zero-indexed count of odd numbers up to
  // the current page if it's odd or the previous page if the
  // current page is even (ex. page = 8, odd idx = 3)
  getOddIdx(newPage) {
    const oddPage = (newPage % 2) ? newPage : (newPage - 1);
    let newOddIdx = 0;
    for (let i = 1; i < oddPage; i += 2)
      newOddIdx++;
    return newOddIdx;
  }

  render() {
    return (
      <div>
        <div id="navContainer">
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            items={this.state.numbPages}
            maxButtons={MAX_BUTTONS}
            activePage={this.state.activePage}
            onSelect={this.pageFromNav.bind(this)}
          />
        </div>
        <div id="docsContainer">
          {this.state.elements}
        </div>
      </div>
    );
  }
}

const Results = connect({
  mapQueriesToProps,
  mapStateToProps,
})(Container);

export const ApolloResults = () => (
  <ApolloProvider client={Client}>
    <Results />
  </ApolloProvider>
);
