var lib = require('../own_modules/school_records');
var assert = require('chai').assert;
var fs = require('fs');
var dbFileData = fs.readFileSync('tests/data/school.db.backup');

var school_records;
describe('school_records',function(){
	beforeEach(function(){
		fs.writeFileSync('tests/data/school.db',dbFileData);
		school_records = lib.init('tests/data/school.db');
	});
	
	describe('#getGrades',function(){
		it('retrieves 2 grades',function(done){
			school_records.getGrades(function(err,grades){
				assert.deepEqual(grades,[{id:1,name:'class1'},{id:2,name:'class2'}]);
				done();
			})
		})
	})

	describe('#getStudentsByGrade',function(){
		it('retrieves the students in the 2 grades',function(done){
			school_records.getStudentsByGrade(function(err,grades){
				assert.lengthOf(grades,2);
				assert.lengthOf(grades[0].students,3);
				assert.lengthOf(grades[1].students,3);
				done();
			})
		})
	})

	describe('#getSubjectsByGrade',function(){
		it('retrieves the subjects in the 2 grades',function(done){
			school_records.getSubjectsByGrade(function(err,grades){
				assert.lengthOf(grades,2);
				assert.lengthOf(grades[0].subjects,3);
				assert.lengthOf(grades[1].subjects,3);
				done();
			})
		})
	})

	describe('#getStudentSummary',function(){
		it('retrieves the summary of the student Jai',function(done){
			school_records.getStudentSummary(4, function(err,s){				
				assert.equal(s.name,'Jai');
				assert.equal(s.grade_name,'class2');
				assert.deepEqual(s.subjects,[{id:4,name:'Baseball',score:100,maxScore:100},
					{id:5,name:'Chess',score:45,maxScore:50},
					{id:6,name:'Rowing',score:24,maxScore:25}]);
				done();
			})
		})

		it('retrieves nothing of the non existent student',function(done){
			school_records.getStudentSummary(9, function(err,s){
				assert.notOk(err);
				assert.notOk(s);				
				done();
			})
		})
	})

	describe('#getSubjectSummary',function(){
		it('retrieves the summary of all Subjects',function(done){
			school_records.getSubjectSummary(function(err,subjectSummary){
				assert.lengthOf(subjectSummary,6);
				assert.lengthOf(Object.keys(subjectSummary[0]),4);
				done();
			})
		})
	})

	describe('#update Grade from grades',function(){
		it('true if updation of class1 into class7 successful',function(done){
			school_records.update_Grade({prev_grade:'1',new_grade:'class7'},function(err,result){
				
				school_records.getGrades(function(err,grades){
					assert.deepEqual(grades[0],{ id: 1, name: 'class7' });
					done();
				})
				assert.notOk(err);
				assert.ok(result);
			})
		})
	})

	describe('#update grade,student_name,score from StudentSummary',function(){
		it('true if updation of grade,student_name,score is successful',function(done){
			var param = { id: '2',new_name: 'Ramu',new_grade: '1',subject: '1',new_score: '88' };
			school_records.updateStudentSummary(param,function(err,result){
				school_records.getStudentSummary(2,function(err,studentSummary){
					assert.deepEqual(studentSummary.name,'Ramu');
					assert.deepEqual(studentSummary.subjects[0],{name:'Cricket',id:1,maxScore:100,score:88});
					done();
				})
				assert.notOk(err);
				assert.ok(result);
			})
		})
	})

	describe('#update subject name,maxScore and grade from SubjectSummary',function(){
		it("true if updation of subject name,maxScore and grade is successful and new_name='KungFu' on id=4",function(done){
			var param = {subject_id:'4',new_grade:'2',new_name:'KungFu',new_score:'80'};
			school_records.updateSubjectSummary(param,function(err,result){
				assert.notOk(err);
				assert.ok(result);
				school_records.getSubjectSummary(function(err,subjectSummary){
					assert.deepEqual(subjectSummary[3],{id:4,name:'KungFu',maxScore:80,grade:'class2'})
					done();
			    })
			})
		})
	})

	describe('#add new student through Grade Summary page',function(){
		it("add new student 'Chris' to class2",function(done){
			var param = {stu_name:'Chris',grade:2};
			school_records.addStudent(param,function(err,result){
				assert.notOk(err);
				assert.ok(result);
				done();
			})
		})
	})

	describe('#add new Subject through Grade Summary page',function(){
		it("add new subject 'KungFu'",function(done){
			var param = {sub_name:'KungFu',maxScore:80,grade:2};
			school_records.addSubject(param,function(err,result){
				assert.notOk(err);
				assert.ok(result);
				done();
			})
		})
	})

	describe('#get subjectSummary by subject name',function(){
		it("show all students' score in Cricket",function(done){
			var studentRecords =[{sub_id:1,subject:'Cricket'},{grade:'class1'},
							   [{ id: 1, name: 'Vishnu', score: 65, grade_id: 1 },
							    { id: 2, name: 'Mahesh', score: 66, grade_id: 1 },
							    { id: 3, name: 'Parmatma', score: 55, grade_id: 1}]];
			school_records.subjectSummaryBySubjectName(1,function(err,result){
				assert.notOk(err);
				assert.deepEqual(result,studentRecords);
				done();
			})
		})
	})

	describe('#add score through subjectSummary by subject name',function(){
		it("add score=70 of given student whose id=2 and subject=Cricket",function(done){
			var param = { student: '2', score: '70', subject: '1' };
			school_records.addScore(param,function(err,result){
				assert.notOk(err);
				assert.ok(result);
				done();
			})
		})
	})

	describe('#get student name by grade',function(){
		it("classSummary returns list of all students in given grade",function(done){
			var students_record = [{ stu_id: 1,stu_name:'Vishnu',grade_id:1,grade:'class1'},
  								{stu_id:2,stu_name:'Mahesh',grade_id:1,grade:'class1'},
  								{stu_id:3,stu_name:'Parmatma',grade_id:1,grade:'class1'}];
			school_records.classSummary(1,function(err,stu_data){
				assert.notOk(err);
				assert.deepEqual(students_record,stu_data[1]);
				done();
			})
		})
		it("classSummary returns list of all subjects in given grade",function(done){
			var subject_record = [{ sub_id: 1, subject: 'Cricket', maxScore: 100 },
  									{ sub_id: 2, subject: 'Hockey', maxScore: 50 },
  									{ sub_id: 3, subject: 'KhoKho', maxScore: 25 }];
  			school_records.classSummary(1,function(err,subject_data){
				assert.notOk(err);
				assert.deepEqual(subject_record,subject_data[0]);
				done();
			})
		})
	})
})