/*
 * This file is part of SketchBand.
 * Copyright (C) 2016  Mikael Brockman
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

let React = require("react")
let color = require("color")

let lighten = (x, n) => color(x).lighten(n).hslString()

export let Pixie = ({ duration }) =>
  <div>
    <style>{`
      @-webkit-keyframes fly {
        from { -webkit-transform: translateX(0); }
        to { -webkit-transform: translateX(100%); }
      }

      @-webkit-keyframes flyfill {
        from { width: 0; }
        to { width: 100%; }
      }

      @-webkit-keyframes pixie {
        0%, 25%, 50%, 75%, 100%  {
          -webkit-transform: translateY(0);
          -webkit-animation-timing-function: ease-out;
        }

        12.5%, 37.5%, 62.5%, 87.5% {
          -webkit-animation-timing-function: ease-in;
        }

        12.5% { -webkit-transform: translateY(-5px); }
        37.5% { -webkit-transform: translateY(-4px); }
        62.5% { -webkit-transform: translateY(-3px); }
        85.5% { -webkit-transform: translateY(-2px); }
      }

      @-webkit-keyframes pixiedown {
        0%, 25%, 50%, 75%, 100%  {
          -webkit-transform: translateY(0);
          -webkit-animation-timing-function: ease-out;
        }

        12.5%, 37.5%, 62.5%, 87.5% {
          -webkit-transform: translateY(1px);
          -webkit-animation-timing-function: ease-in;
        }          
      }
    `}</style>
    <div style={{
      position: "absolute",
      top: "-0.5rem",
      left: 0,
      right: 0,
    }}>
      <div style={{
        WebkitAnimation: `fly ${duration}s linear infinite`
      }}>
        <div style={{
          width: "0.5rem",
          borderRadius: "0.25rem",
          height: "0.5rem",
          background: lighten("cornflowerblue", 0.2),
          WebkitAnimation: `pixie ${duration}s linear infinite`
        }}/>
      </div>
    </div>
  </div>
