import { Component, OnInit } from '@angular/core';
import { CitySearchComponent } from './city-search/city-search.component';
import { InternalizationPipe } from '../../shared/pipes/i18n.pipe';
import { CityPreviewComponent } from './city-preview/city-preview.component';
import { MatButtonModule } from '@angular/material/button';
import { CityPreviewService } from './city-preview/city-preview.service';
import { StrengthSliderComponent } from './strength-slider/strength-slider.component';
import { DataTableService } from '../data-table/data-table.service';
import { DataTableRow } from '../data-table/data-table-row.interface';
import { getEnumKeyByValue } from '../../shared/helpers/enum-manager';
import { WeatherTypes } from '../../shared/enum/weather.enum';
import { CityPreviewData } from './city-preview/city-preview-data';
import { CrudService } from '../../shared/services/crud.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
    selector: 'app-input-data',
    standalone: true,
    templateUrl: './input-data.component.html',
    styleUrl: './input-data.component.scss',
    imports: [
        CitySearchComponent, 
        StrengthSliderComponent, 
        CityPreviewComponent, 
        InternalizationPipe,
        MatButtonModule
    ]
})
export class InputDataComponent implements OnInit{

    isDisabled: boolean = true;

    networkStrength: number = 0;

    constructor(
        private cityPreviewService: CityPreviewService,
        private dataTableService: DataTableService,
        private crudService: CrudService,
        private toastService: ToastService
    ){}

    ngOnInit(): void {
        this.cityPreviewService.haveNewData.subscribe(() => {
            this.isDisabled = !(this.cityPreviewService.checkHavePreviewData())
        })
    }

    resetForm(): void {
        this.cityPreviewService.removePreviewData();
    }

    addItem(networkStrength: number) {
        this.networkStrength = networkStrength;
    }

    submitForm(): void {
        const previewData: CityPreviewData | undefined = this.cityPreviewService.getCityPreview();
        const currentUTCDate: Date = new Date();
    
        if(previewData) {
            let newRow: DataTableRow = {
                city: previewData.city,
                weather: getEnumKeyByValue(WeatherTypes, previewData.weather),
                temp: `${previewData.temperature}`,
                humidity: `${previewData.humidity}`,
                pressure: `${previewData.pressure}`,
                sea_level: `${previewData.sea_level}`,
                insert_date: currentUTCDate.toISOString(),
                network_strength: this.networkStrength
            };
            
            this.crudService.addCity(newRow).subscribe({
                next: (value) => {
                    this.dataTableService.addRow(value);
                    this.toastService.showToast("form.input.success", "success");
                },
                error: (e) => this.toastService.showToast("form.input.error", "error"),
                complete: () => console.info('Get city list request...') 
            })
        }
    }

}
