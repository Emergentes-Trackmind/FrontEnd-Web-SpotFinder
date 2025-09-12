import { Component } from '@angular/core';
import {Analytics} from '../../components/analytics/analytics';

@Component({
  selector: 'app-home-page',
  imports: [
    Analytics
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {

}
