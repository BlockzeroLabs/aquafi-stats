import React from 'react'

import styled from 'styled-components'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { TYPE, ExternalLink } from 'theme'
import { useEthPrices } from 'hooks/useEthPrices'
import { formatDollarAmount } from 'utils/numbers'
import { changeProtocol } from '../../state/user/actions'
import { AppDispatch } from '../../state/index'
import { useDispatch } from 'react-redux'

import Polling from './Polling'
import { fontSize } from 'styled-system'
import { Link } from 'react-router-dom'

const Wrapper = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.black};
  padding: 10px 20px;
`

const Item = styled(TYPE.main)`
  font-size: 12px;
`

const StyledLink = styled(ExternalLink)`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`

const TopBar = () => {
  const dispatch = useDispatch<AppDispatch>()

  const ethPrices = useEthPrices()

  return (
    <Wrapper>
      <RowBetween>
        <Polling />
        <AutoRow gap="6px">
          <RowFixed>
            <Item>ETH Price:</Item>
            <Item fontWeight="700" ml="4px">
              {formatDollarAmount(ethPrices?.current)}
            </Item>
          </RowFixed>
        </AutoRow>
        <AutoRow gap="6px" style={{ justifyContent: 'flex-end' }}>
          {/* <Link
            to="/"
            style={{ cursor: 'pointer', fontSize: '12px', textDecoration: 'none', color: 'white' }}
            onClick={() => dispatch(changeProtocol('sushi'))}
          >
            Sushi Analytics
          </Link>

          <Link
            to="/"
            style={{ cursor: 'pointer', fontSize: '12px', textDecoration: 'none', color: 'white' }}
            onClick={() => dispatch(changeProtocol('v2'))}
          >
            V2 Analytics
          </Link>

          <Link
            to="/"
            style={{ cursor: 'pointer', fontSize: '12px', textDecoration: 'none', color: 'white' }}
            onClick={() => dispatch(changeProtocol('v3'))}
          >
            V3 Analytics
          </Link> */}

          <StyledLink href="https://dev.aquafi.io/">App</StyledLink>
        </AutoRow>
      </RowBetween>
    </Wrapper>
  )
}

export default TopBar
